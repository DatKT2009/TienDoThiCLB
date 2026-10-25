import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quyền Admin' }, { status: 401 })
    }

    const body = await req.json()
    const { examId, questions } = body

    if (!examId || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng cung cấp mã kỳ thi và danh sách câu hỏi hợp lệ'
      }, { status: 400 })
    }

    let importedCount = 0
    for (let index = 0; index < questions.length; index++) {
      const q = questions[index]
      if (!q || !q.content) continue

      await prisma.question.create({
        data: {
          examId,
          content: q.content,
          questionType: q.questionType || 'SINGLE_CHOICE',
          optionsJson: typeof q.options === 'object' ? JSON.stringify(q.options) : q.optionsJson || null,
          correctAnswer: typeof q.correctAnswer === 'object' ? JSON.stringify(q.correctAnswer) : q.correctAnswer || null,
          explanation: q.explanation || null,
          score: Number(q.score || 1.0),
          difficulty: q.difficulty || 'MEDIUM',
          category: q.category || 'KIEN_THUC_DOAN',
          rubricJson: typeof q.rubric === 'object' ? JSON.stringify(q.rubric) : q.rubricJson || null,
          multiChoiceScoring: q.multiChoiceScoring || 'PARTIAL_CREDIT',
          orderIndex: Number(q.orderIndex || index + 1)
        }
      })
      importedCount++
    }

    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: 'IMPORT_QUESTIONS',
        targetType: 'EXAM',
        targetId: examId,
        detailsJson: JSON.stringify({ importedCount })
      }
    })

    return NextResponse.json({
      success: true,
      message: `Đã nhập thành công ${importedCount} câu hỏi vào kỳ thi!`,
      importedCount
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
