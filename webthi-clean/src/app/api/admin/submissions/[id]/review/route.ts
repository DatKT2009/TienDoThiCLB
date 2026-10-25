import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { syncSubmissionToGoogleSheets } from '@/services/google-sheets'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quyền Admin' }, { status: 401 })
    }

    const body = await req.json()
    const { action, manualScore, notes, questionScores } = body

    const submission = await prisma.submission.findUnique({
      where: { id: params.id }
    })

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Bài nộp không tồn tại' }, { status: 404 })
    }

    let updatedFinalScore = submission.finalScore
    let newManualScore = submission.manualScore
    let newReviewStatus = 'APPROVED'

    // If specific question score updates were provided
    if (questionScores && typeof questionScores === 'object') {
      let sumUpdated = 0
      for (const [ansId, newScore] of Object.entries(questionScores)) {
        await prisma.answer.update({
          where: { id: ansId },
          data: {
            score: Number(newScore),
            gradingStatus: 'MANUAL_GRADED'
          }
        })
      }

      // Recalculate total score
      const allAnswers = await prisma.answer.findMany({
        where: { submissionId: submission.id }
      })
      sumUpdated = allAnswers.reduce((acc, a) => acc + a.score, 0)
      updatedFinalScore = Math.min(submission.maxScore, Math.round(sumUpdated * 10) / 10)
      newManualScore = updatedFinalScore
    } else if (manualScore !== undefined) {
      newManualScore = Number(manualScore)
      updatedFinalScore = Math.min(submission.maxScore, newManualScore)
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: submission.id },
      data: {
        finalScore: updatedFinalScore,
        manualScore: newManualScore,
        reviewStatus: newReviewStatus,
        gradingStatus: 'REVIEWED'
      }
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: 'REVIEW_SUBMISSION',
        targetType: 'SUBMISSION',
        targetId: submission.id,
        detailsJson: JSON.stringify({
          previousScore: submission.finalScore,
          newScore: updatedFinalScore,
          adminUser: admin.username,
          notes: notes || 'Admin duyệt điểm AI và điều chỉnh',
          action
        })
      }
    })

    // Trigger Google Sheets update
    syncSubmissionToGoogleSheets(submission.id).catch(e => console.error('Sheet update failed', e))

    return NextResponse.json({
      success: true,
      message: 'Đã duyệt và cập nhật điểm số thành công!',
      submission: updatedSubmission
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
