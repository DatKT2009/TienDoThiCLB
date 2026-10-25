import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quyền Admin' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const examId = searchParams.get('examId')
    const status = searchParams.get('status')
    const reviewStatus = searchParams.get('reviewStatus')
    const query = searchParams.get('q')

    const where: any = {
      submittedAt: { not: null }
    }

    if (examId && examId !== 'ALL') {
      where.examId = examId
    }
    if (status && status !== 'ALL') {
      where.gradingStatus = status
    }
    if (reviewStatus && reviewStatus !== 'ALL') {
      where.reviewStatus = reviewStatus
    }
    if (query) {
      where.OR = [
        { candidateCode: { contains: query } },
        { fullName: { contains: query } },
        { lookupCode: { contains: query } }
      ]
    }

    const submissions = await prisma.submission.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      include: {
        exam: { select: { title: true, maxScore: true, passingScore: true } },
        _count: { select: { answers: true } }
      }
    })

    return NextResponse.json({ success: true, submissions })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
