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

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        exam: true,
        answers: {
          include: {
            question: true
          },
          orderBy: { question: { orderIndex: 'asc' } }
        },
        gradingResults: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Bài nộp không tồn tại' }, { status: 404 })
    }

    return NextResponse.json({ success: true, submission })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
