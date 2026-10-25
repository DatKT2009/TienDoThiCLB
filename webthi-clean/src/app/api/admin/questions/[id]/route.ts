import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

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
      content,
      questionType,
      optionsJson,
      correctAnswer,
      explanation,
      score,
      difficulty,
      category,
      rubricJson,
      multiChoiceScoring,
      orderIndex
    } = body

    const updated = await prisma.question.update({
      where: { id: params.id },
      data: {
        ...(content && { content }),
        ...(questionType && { questionType }),
        ...(optionsJson !== undefined && {
          optionsJson: typeof optionsJson === 'object' ? JSON.stringify(optionsJson) : optionsJson
        }),
        ...(correctAnswer !== undefined && {
          correctAnswer: typeof correctAnswer === 'object' ? JSON.stringify(correctAnswer) : correctAnswer
        }),
        ...(explanation !== undefined && { explanation }),
        ...(score !== undefined && { score: Number(score) }),
        ...(difficulty && { difficulty }),
        ...(category && { category }),
        ...(rubricJson !== undefined && {
          rubricJson: typeof rubricJson === 'object' ? JSON.stringify(rubricJson) : rubricJson
        }),
        ...(multiChoiceScoring && { multiChoiceScoring }),
        ...(orderIndex !== undefined && { orderIndex: Number(orderIndex) })
      }
    })

    return NextResponse.json({ success: true, question: updated })
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

    await prisma.question.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true, message: 'Đã xóa câu hỏi thành công' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
