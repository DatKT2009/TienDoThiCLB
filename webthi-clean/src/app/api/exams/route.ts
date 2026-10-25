import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const audience = searchParams.get('audience')
    const query = searchParams.get('q')

    const where: any = {}

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (audience && audience !== 'ALL') {
      if (audience === 'INTERVIEW') {
        where.OR = [
          { targetAudience: 'ALL' },
          { targetAudience: 'INTERVIEW' }
        ]
      } else if (audience === 'MEMBER') {
        where.OR = [
          { targetAudience: 'ALL' },
          { targetAudience: 'MEMBER' },
          { targetAudience: 'CTV' },
          { targetAudience: 'EXECUTIVE' }
        ]
      } else {
        where.OR = [
          { targetAudience: 'ALL' },
          { targetAudience: audience }
        ]
      }
    }

    if (query) {
      where.title = { contains: query }
    }

    const exams = await prisma.exam.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        targetAudience: true,
        durationMinutes: true,
        totalQuestions: true,
        maxScore: true,
        passingScore: true,
        startTime: true,
        endTime: true,
        status: true,
        oneAttemptPolicy: true,
        isLeaderboardPublic: true,
        _count: {
          select: { submissions: true, questions: true }
        }
      }
    })

    return NextResponse.json({ success: true, exams })
  } catch (error: any) {
    console.error('Failed to get exams:', error)
    return NextResponse.json({ success: false, error: 'Lỗi tải danh sách kỳ thi' }, { status: 500 })
  }
}
