import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { slug: params.slug },
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

    if (!exam) {
      return NextResponse.json({ success: false, error: 'Kỳ thi không tồn tại' }, { status: 404 })
    }

    return NextResponse.json({ success: true, exam })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
