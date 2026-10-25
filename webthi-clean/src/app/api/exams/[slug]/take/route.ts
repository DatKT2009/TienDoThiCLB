import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractClientIp, extractDeviceFingerprint, verifyExamAttemptEligibility } from '@/services/anti-cheat'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const candidateCode = searchParams.get('candidateCode')

    if (!candidateCode) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin mã thí sinh' }, { status: 400 })
    }

    const exam = await prisma.exam.findUnique({
      where: { slug: params.slug },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            content: true,
            questionType: true,
            optionsJson: true,
            score: true,
            difficulty: true,
            category: true,
            orderIndex: true,
            // SECURITY: Explicitly OMIT correctAnswer, explanation, rubricJson!
          }
        }
      }
    })

    if (!exam) {
      return NextResponse.json({ success: false, error: 'Kỳ thi không tồn tại' }, { status: 404 })
    }

    const clientIp = extractClientIp(req)
    const deviceFingerprint = extractDeviceFingerprint(req)
    const eligibility = await verifyExamAttemptEligibility(
      exam.id,
      candidateCode.toUpperCase(),
      clientIp,
      deviceFingerprint
    )

    if (!eligibility.allowed) {
      return NextResponse.json({
        success: false,
        error: eligibility.blockedReason,
        blockedType: eligibility.blockedType
      }, { status: 403 })
    }

    // Parse optionsJson into array
    const sanitizedQuestions = exam.questions.map(q => {
      let parsedOptions: string[] = []
      if (q.optionsJson) {
        try {
          parsedOptions = JSON.parse(q.optionsJson)
        } catch {
          parsedOptions = []
        }
      }
      return {
        ...q,
        options: parsedOptions
      }
    })

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        title: exam.title,
        slug: exam.slug,
        durationMinutes: exam.durationMinutes,
        totalQuestions: sanitizedQuestions.length,
        maxScore: exam.maxScore
      },
      questions: sanitizedQuestions
    })
  } catch (error: any) {
    console.error('Failed to load exam questions:', error)
    return NextResponse.json({ success: false, error: 'Lỗi tải nội dung đề thi' }, { status: 500 })
  }
}
