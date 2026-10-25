import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yêu cầu quyền Quản trị viên' }, { status: 401 })
    }

    const [
      totalExams,
      totalCandidates,
      totalSubmissions,
      pendingAiCount,
      pendingSyncCount,
      activeLocksCount,
      recentSubmissions,
      allFinishedSubmissions
    ] = await Promise.all([
      prisma.exam.count(),
      prisma.candidate.count(),
      prisma.submission.count({ where: { submittedAt: { not: null } } }),
      prisma.submission.count({
        where: {
          submittedAt: { not: null },
          reviewStatus: 'NEEDS_REVIEW'
        }
      }),
      prisma.submission.count({
        where: {
          syncStatus: { in: ['PENDING', 'FAILED'] },
          submittedAt: { not: null }
        }
      }),
      prisma.examAttemptLock.count({ where: { status: 'ACTIVE' } }),
      prisma.submission.findMany({
        where: { submittedAt: { not: null } },
        orderBy: { submittedAt: 'desc' },
        take: 8,
        include: {
          exam: { select: { title: true } }
        }
      }),
      prisma.submission.findMany({
        where: { submittedAt: { not: null } },
        select: { finalScore: true, participantType: true }
      })
    ])

    // Calculate score distribution for Recharts
    const scoreBuckets = [
      { range: '0 - 20đ', count: 0 },
      { range: '21 - 40đ', count: 0 },
      { range: '41 - 60đ', count: 0 },
      { range: '61 - 80đ', count: 0 },
      { range: '81 - 100đ', count: 0 }
    ]

    let totalScoreSum = 0
    for (const sub of allFinishedSubmissions) {
      totalScoreSum += sub.finalScore
      const s = sub.finalScore
      if (s <= 20) scoreBuckets[0].count++
      else if (s <= 40) scoreBuckets[1].count++
      else if (s <= 60) scoreBuckets[2].count++
      else if (s <= 80) scoreBuckets[3].count++
      else scoreBuckets[4].count++
    }

    const avgScore =
      totalSubmissions > 0 ? Math.round((totalScoreSum / totalSubmissions) * 10) / 10 : 0

    // Demographic counts
    const participantBreakdown = [
      { name: 'Cộng tác viên (CTV)', count: allFinishedSubmissions.filter(s => s.participantType === 'CTV').length },
      { name: 'Thành viên CLB', count: allFinishedSubmissions.filter(s => s.participantType === 'MEMBER').length },
      { name: 'Ban Điều hành', count: allFinishedSubmissions.filter(s => s.participantType === 'EXECUTIVE').length }
    ]

    return NextResponse.json({
      success: true,
      stats: {
        totalExams,
        totalCandidates,
        totalSubmissions,
        pendingAiCount,
        pendingSyncCount,
        activeLocksCount,
        avgScore
      },
      charts: {
        scoreDistribution: scoreBuckets,
        participantBreakdown
      },
      recentSubmissions: recentSubmissions.map(s => ({
        id: s.id,
        examTitle: s.exam.title,
        candidateCode: s.candidateCode,
        fullName: s.fullName,
        participantType: s.participantType,
        finalScore: s.finalScore,
        maxScore: s.maxScore,
        gradingStatus: s.gradingStatus,
        reviewStatus: s.reviewStatus,
        syncStatus: s.syncStatus,
        submittedAt: s.submittedAt
      }))
    })
  } catch (error: any) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ success: false, error: 'Lỗi tải dữ liệu bảng điều khiển' }, { status: 500 })
  }
}
