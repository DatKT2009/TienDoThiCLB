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
    const status = searchParams.get('status') || 'ACTIVE'

    const where: any = {}
    if (examId && examId !== 'ALL') where.examId = examId
    if (status && status !== 'ALL') where.status = status

    const locks = await prisma.examAttemptLock.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        exam: { select: { title: true } }
      }
    })

    return NextResponse.json({ success: true, locks })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
