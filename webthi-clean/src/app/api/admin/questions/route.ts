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

    const where = examId ? { examId } : {}
    const questions = await prisma.question.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
      include: {
        exam: { select: { title: true } }
      }
    })

    return NextResponse.json({ success: true, questions })
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
      examId,
      content,
      questionType,
      optionsJson,
      correctAnswer,
      explanation,
      score = 1.0,
      difficulty = 'MEDIUM',
      category = 'KY_NANG_CLB',
      rubricJson,
      multiChoiceScoring = 'PARTIAL_CREDIT',
      orderIndex
    } = body

    if (!examId || !content || !questionType) {
      return NextResponse.json({ success: false, error: 'Vui lòng điền đầy đủ kỳ thi, nội dung và loại câu hỏi' }, { status: 400 })
    }

    // Auto calculate next orderIndex if not provided
    let finalOrder = orderIndex
    if (finalOrder === undefined) {
      const lastQ = await prisma.question.findFirst({
        where: { examId },
        orderBy: { orderIndex: 'desc' }
      })
      finalOrder = (lastQ?.orderIndex || 0) + 1
    }

    const question = await prisma.question.create({
      data: {
        examId,
        content,
        questionType,
        optionsJson: typeof optionsJson === 'object' ? JSON.stringify(optionsJson) : optionsJson,
        correctAnswer: typeof correctAnswer === 'object' ? JSON.stringify(correctAnswer) : correctAnswer,
        explanation,
        score: Number(score),
        difficulty,
        category,
        rubricJson: typeof rubricJson === 'object' ? JSON.stringify(rubricJson) : rubricJson,
        multiChoiceScoring,
        orderIndex: finalOrder
      }
    })

    return NextResponse.json({ success: true, question })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
