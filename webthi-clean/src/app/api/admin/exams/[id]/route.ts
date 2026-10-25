import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quyền Admin' }, { status: 401 })
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: { submissions: true, attemptLocks: true }
        }
      }
    })

    if (!exam) {
      return NextResponse.json({ success: false, error: 'Kỳ thi không tồn tại' }, { status: 404 })
    }

    return NextResponse.json({ success: true, exam })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quyền Admin' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      description,
      targetAudience,
      durationMinutes,
      totalQuestions,
      maxScore,
      passingScore,
      startTime,
      endTime,
      status,
      oneAttemptPolicy,
      allowReview,
      isLeaderboardPublic,
      hideLeaderboardNames
    } = body

    const updated = await prisma.exam.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(targetAudience && { targetAudience }),
        ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
        ...(totalQuestions !== undefined && { totalQuestions: Number(totalQuestions) }),
        ...(maxScore !== undefined && { maxScore: Number(maxScore) }),
        ...(passingScore !== undefined && { passingScore: Number(passingScore) }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(status && { status }),
        ...(oneAttemptPolicy && { oneAttemptPolicy }),
        ...(allowReview !== undefined && { allowReview }),
        ...(isLeaderboardPublic !== undefined && { isLeaderboardPublic }),
        ...(hideLeaderboardNames !== undefined && { hideLeaderboardNames })
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: 'UPDATE_EXAM',
        targetType: 'EXAM',
        targetId: params.id,
        detailsJson: JSON.stringify(body)
      }
    })

    return NextResponse.json({ success: true, exam: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quyền Admin' }, { status: 401 })
    }

    await prisma.exam.delete({
      where: { id: params.id }
    })

    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: 'DELETE_EXAM',
        targetType: 'EXAM',
        targetId: params.id
      }
    })

    return NextResponse.json({ success: true, message: 'Đã xóa kỳ thi thành công' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
