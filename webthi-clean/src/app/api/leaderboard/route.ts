import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function maskFullName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return fullName
  return parts
    .map((p, idx) => {
      if (idx === 0) return p
      if (idx === parts.length - 1) return p
      return p[0] + '*'.repeat(Math.max(1, p.length - 1))
    })
    .join(' ')
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const examSlug = searchParams.get('exam')
    const group = searchParams.get('group')

    let targetExamId = ''
    let isPublic = true
    let hideNames = false

    if (examSlug) {
      const exam = await prisma.exam.findUnique({
        where: { slug: examSlug }
      })
      if (exam) {
        targetExamId = exam.id
        isPublic = exam.isLeaderboardPublic
        hideNames = exam.hideLeaderboardNames
      }
    } else {
      // Find latest active exam
      const latestExam = await prisma.exam.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' }
      })
      if (latestExam) {
        targetExamId = latestExam.id
        isPublic = latestExam.isLeaderboardPublic
        hideNames = latestExam.hideLeaderboardNames
      }
    }

    if (!isPublic) {
      return NextResponse.json({
        success: true,
        isPublic: false,
        message: 'Bảng xếp hạng kỳ thi này hiện đang được tạm ẩn theo quy định của Ban Tổ chức.',
        leaderboard: []
      })
    }

    const whereClause: any = {
      submittedAt: { not: null }
    }
    if (targetExamId) {
      whereClause.examId = targetExamId
    }
    if (group && group !== 'ALL') {
      whereClause.participantType = group
    }

    const submissions = await prisma.submission.findMany({
      where: whereClause,
      include: {
        exam: {
          select: { title: true, slug: true, maxScore: true }
        }
      },
      orderBy: [
        { finalScore: 'desc' },
        { durationSeconds: 'asc' }
      ],
      take: 50
    })

    const leaderboard = submissions.map((sub, index) => ({
      rank: index + 1,
      id: sub.id,
      candidateCode: sub.candidateCode,
      displayName: hideNames ? maskFullName(sub.fullName) : sub.fullName,
      participantType: sub.participantType,
      unitName: sub.unitName,
      examTitle: sub.exam.title,
      finalScore: sub.finalScore,
      maxScore: sub.maxScore,
      durationSeconds: sub.durationSeconds,
      submittedAt: sub.submittedAt
    }))

    return NextResponse.json({
      success: true,
      isPublic: true,
      leaderboard
    })
  } catch (error: any) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json({ success: false, error: 'Lỗi tải bảng xếp hạng' }, { status: 500 })
  }
}
