import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quyền Admin' }, { status: 401 })
    }

    const exams = await prisma.exam.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { questions: true, submissions: true, attemptLocks: true }
        }
      }
    })

    return NextResponse.json({ success: true, exams })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quyền Admin' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      description,
      targetAudience = 'ALL',
      durationMinutes = 30,
      totalQuestions = 10,
      maxScore = 100,
      passingScore = 50,
      startTime,
      endTime,
      status = 'ACTIVE',
      oneAttemptPolicy = 'CANDIDATE_AND_IP',
      allowReview = true,
      isLeaderboardPublic = true,
      hideLeaderboardNames = false
    } = body

    if (!title || !description) {
      return NextResponse.json({ success: false, error: 'Vui lòng điền tiêu đề và mô tả kỳ thi' }, { status: 400 })
    }

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`

    const exam = await prisma.exam.create({
      data: {
        title,
        slug,
        description,
        targetAudience,
        durationMinutes: Number(durationMinutes),
        totalQuestions: Number(totalQuestions),
        maxScore: Number(maxScore),
        passingScore: Number(passingScore),
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date(Date.now() + 30 * 24 * 3600 * 1000),
        status,
        oneAttemptPolicy,
        allowReview,
        isLeaderboardPublic,
        hideLeaderboardNames
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: 'CREATE_EXAM',
        targetType: 'EXAM',
        targetId: exam.id,
        detailsJson: JSON.stringify({ title, slug })
      }
    })

    return NextResponse.json({ success: true, exam })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
