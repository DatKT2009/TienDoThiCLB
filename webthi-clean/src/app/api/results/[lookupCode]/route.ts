import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { lookupCode: string } }
) {
  try {
    const code = params.lookupCode.trim().toUpperCase()

    const submission = await prisma.submission.findUnique({
      where: { lookupCode: code },
      include: {
        exam: {
          select: {
            title: true,
            slug: true,
            maxScore: true,
            passingScore: true,
            allowReview: true
          }
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                questionType: true,
                score: true,
                category: true,
                orderIndex: true
              }
            }
          },
          orderBy: { question: { orderIndex: 'asc' } }
        },
        gradingResults: true
      }
    })

    if (!submission) {
      return NextResponse.json({
        success: false,
        error: `Không tìm thấy kết quả bài thi với mã tra cứu [${code}]. Vui lòng kiểm tra lại.`
      }, { status: 404 })
    }

    // Build user-safe answer review breakdown
    const reviewDetails = submission.answers.map(ans => {
      let aiFeedback: any = null
      if (ans.aiFeedbackJson) {
        try {
          aiFeedback = JSON.parse(ans.aiFeedbackJson)
        } catch {
          aiFeedback = { feedback: ans.aiFeedbackJson }
        }
      }

      return {
        questionId: ans.questionId,
        questionOrder: ans.question.orderIndex,
        questionContent: ans.question.content,
        questionType: ans.question.questionType,
        score: ans.score,
        maxScore: ans.maxScore,
        isCorrect: ans.isCorrect,
        gradingStatus: ans.gradingStatus,
        feedback: aiFeedback?.feedback || '',
        strengths: aiFeedback?.strengths || '',
        improvements: aiFeedback?.improvements || '',
        criteriaScores: aiFeedback?.criteriaScores || []
      }
    })

    return NextResponse.json({
      success: true,
      result: {
        id: submission.id,
        lookupCode: submission.lookupCode,
        examTitle: submission.exam.title,
        examSlug: submission.exam.slug,
        candidateCode: submission.candidateCode,
        fullName: submission.fullName,
        participantType: submission.participantType,
        unitName: submission.unitName,
        submittedAt: submission.submittedAt,
        durationSeconds: submission.durationSeconds,
        objectiveScore: submission.objectiveScore,
        aiScore: submission.aiScore,
        manualScore: submission.manualScore,
        finalScore: submission.finalScore,
        maxScore: submission.maxScore,
        passingScore: submission.exam.passingScore,
        isPassed: submission.finalScore >= submission.exam.passingScore,
        gradingStatus: submission.gradingStatus,
        reviewStatus: submission.reviewStatus,
        allowReview: submission.exam.allowReview,
        answers: submission.exam.allowReview ? reviewDetails : []
      }
    })
  } catch (error: any) {
    console.error('Result lookup error:', error)
    return NextResponse.json({ success: false, error: 'Lỗi tra cứu kết quả thi' }, { status: 500 })
  }
}
