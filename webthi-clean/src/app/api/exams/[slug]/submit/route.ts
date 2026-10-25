import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { extractClientIp, extractDeviceFingerprint, createIpFingerprint, acquireAttemptLocks, verifyExamAttemptEligibility } from '@/services/anti-cheat'
import { gradeObjectiveQuestion, gradeEssayWithAi } from '@/services/ai-grading'
import { syncSubmissionToGoogleSheets } from '@/services/google-sheets'

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await req.json()
    const {
      candidateCode,
      fullName,
      participantType,
      unitName,
      answers = {}, // map: questionId -> answer (string or array of strings)
      durationSeconds = 0,
      startedAt
    } = body

    if (!candidateCode || !fullName) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin thí sinh' }, { status: 400 })
    }

    const exam = await prisma.exam.findUnique({
      where: { slug: params.slug },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    })

    if (!exam) {
      return NextResponse.json({ success: false, error: 'Kỳ thi không tồn tại' }, { status: 404 })
    }

    const clientIp = extractClientIp(req)
    const explicitDevice = body.deviceFingerprint
    const deviceFingerprint = extractDeviceFingerprint(req, explicitDevice)
    const ipFingerprint = createIpFingerprint(deviceFingerprint !== 'DEV-DEFAULT' ? deviceFingerprint : clientIp)
    const normCode = candidateCode.trim().toUpperCase()

    // 1. Check attempt eligibility (Mã thí sinh + Máy/Thiết bị)
    const eligibility = await verifyExamAttemptEligibility(exam.id, normCode, clientIp, deviceFingerprint)
    if (!eligibility.allowed) {
      return NextResponse.json({
        success: false,
        error: eligibility.blockedReason,
        blockedType: eligibility.blockedType
      }, { status: 403 })
    }

    // 2. Atomically lock attempt in database to prevent parallel submissions
    const lockResult = await acquireAttemptLocks(exam.id, normCode, clientIp, deviceFingerprint)
    if (!lockResult.success) {
      return NextResponse.json({
        success: false,
        error: lockResult.error || 'Bạn đã hoàn thành bài thi này hoặc đang có phiên thi khác hoạt động.'
      }, { status: 403 })
    }

    // 3. Generate secure unique lookupCode
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase()
    const lookupCode = `TD-${new Date().getFullYear()}-${normCode.replace(/[^A-Z0-9]/g, '')}-${randomHex}`

    // 4. Create base submission record
    const submission = await prisma.submission.create({
      data: {
        examId: exam.id,
        candidateCode: normCode,
        fullName: fullName.trim(),
        participantType: participantType || 'CTV',
        unitName: unitName || 'Chi đoàn / CLB',
        ipFingerprint,
        userAgent: req.headers.get('user-agent') || 'Browser',
        startedAt: startedAt ? new Date(startedAt) : new Date(Date.now() - durationSeconds * 1000),
        submittedAt: new Date(),
        durationSeconds: Math.max(1, durationSeconds),
        maxScore: exam.maxScore,
        lookupCode,
        gradingStatus: 'PENDING',
        reviewStatus: 'AUTO'
      }
    })

    // 5. Grade answers question by question
    let totalObjectiveScore = 0
    let totalAiScore = 0
    let hasEssay = false

    for (const q of exam.questions) {
      const candidateAns = answers[q.id]
      const ansString = Array.isArray(candidateAns) ? candidateAns.join(', ') : (candidateAns || '')

      if (
        q.questionType === 'SINGLE_CHOICE' ||
        q.questionType === 'MULTIPLE_CHOICE' ||
        q.questionType === 'TRUE_FALSE' ||
        q.questionType === 'SHORT_ANSWER'
      ) {
        const objResult = gradeObjectiveQuestion(
          q.questionType,
          candidateAns || '',
          q.correctAnswer,
          q.score,
          q.multiChoiceScoring
        )

        totalObjectiveScore += objResult.score

        await prisma.answer.create({
          data: {
            submissionId: submission.id,
            questionId: q.id,
            questionType: q.questionType,
            answerText: typeof candidateAns === 'string' ? candidateAns : null,
            selectedOptionsJson: Array.isArray(candidateAns) ? JSON.stringify(candidateAns) : null,
            isCorrect: objResult.isCorrect,
            score: objResult.score,
            maxScore: q.score,
            aiFeedbackJson: JSON.stringify({ feedback: objResult.feedback }),
            gradingStatus: 'AUTO_GRADED'
          }
        })
      } else if (q.questionType === 'ESSAY' || q.questionType === 'SITUATION') {
        hasEssay = true

        // Grade essay with AI / rubric engine
        const aiResult = await gradeEssayWithAi(
          q.content,
          ansString,
          q.correctAnswer,
          q.rubricJson,
          q.score
        )

        totalAiScore += aiResult.score

        await prisma.answer.create({
          data: {
            submissionId: submission.id,
            questionId: q.id,
            questionType: q.questionType,
            answerText: ansString,
            isCorrect: aiResult.score >= q.score * 0.5,
            score: aiResult.score,
            maxScore: q.score,
            aiFeedbackJson: JSON.stringify(aiResult),
            gradingStatus: 'AI_GRADED'
          }
        })

        await prisma.gradingResult.create({
          data: {
            submissionId: submission.id,
            questionId: q.id,
            aiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
            score: aiResult.score,
            maxScore: q.score,
            criteriaScoresJson: JSON.stringify(aiResult.criteriaScores),
            feedback: aiResult.feedback,
            strengths: aiResult.strengths,
            improvements: aiResult.improvements,
            reasoning: aiResult.reasoning,
            rawResponse: aiResult.rawResponse || null
          }
        })
      }
    }

    const finalScore = Math.min(exam.maxScore, Math.round((totalObjectiveScore + totalAiScore) * 10) / 10)

    // 6. Update final submission state
    const finalized = await prisma.submission.update({
      where: { id: submission.id },
      data: {
        objectiveScore: Math.round(totalObjectiveScore * 10) / 10,
        aiScore: Math.round(totalAiScore * 10) / 10,
        finalScore,
        gradingStatus: hasEssay ? 'AI_GRADED' : 'OBJECTIVE_GRADED',
        reviewStatus: hasEssay ? 'NEEDS_REVIEW' : 'APPROVED'
      }
    })

    // 7. Background sync to Google Sheets (non-blocking)
    syncSubmissionToGoogleSheets(finalized.id).catch(err => {
      console.error('Async Google Sheets sync background error:', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Nộp bài thi thành công!',
      submission: {
        id: finalized.id,
        lookupCode: finalized.lookupCode,
        examTitle: exam.title,
        candidateCode: finalized.candidateCode,
        fullName: finalized.fullName,
        objectiveScore: finalized.objectiveScore,
        aiScore: finalized.aiScore,
        finalScore: finalized.finalScore,
        maxScore: finalized.maxScore,
        passingScore: exam.passingScore,
        isPassed: finalized.finalScore >= exam.passingScore,
        durationSeconds: finalized.durationSeconds,
        gradingStatus: finalized.gradingStatus,
        reviewStatus: finalized.reviewStatus,
        submittedAt: finalized.submittedAt
      }
    })
  } catch (error: any) {
    console.error('Submission error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi xử lý nộp bài thi'
    }, { status: 500 })
  }
}
