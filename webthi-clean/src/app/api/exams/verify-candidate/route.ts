import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractClientIp, extractDeviceFingerprint, verifyExamAttemptEligibility } from '@/services/anti-cheat'
import { z } from 'zod'

const verifySchema = z.object({
  examSlug: z.string().min(1, 'Mã kỳ thi không được để trống'),
  candidateCode: z.string().min(2, 'Vui lòng nhập mã thí sinh / CTV'),
  fullName: z.string().min(2, 'Vui lòng nhập họ và tên'),
  participantType: z.enum(['CTV', 'MEMBER', 'EXECUTIVE']),
  unitName: z.string().min(2, 'Vui lòng nhập Chi đoàn / Ban chức năng'),
  agreedTerms: z.boolean().refine(val => val === true, 'Bạn cần xác nhận đã đọc và đồng ý với thể lệ')
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = verifySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: parsed.error.errors[0]?.message || 'Dữ liệu không hợp lệ'
      }, { status: 400 })
    }

    const { examSlug, candidateCode, fullName, participantType, unitName } = parsed.data
    const clientIp = extractClientIp(req)

    // Find Exam
    const exam = await prisma.exam.findUnique({
      where: { slug: examSlug }
    })

    if (!exam) {
      return NextResponse.json({ success: false, error: 'Kỳ thi không tồn tại.' }, { status: 404 })
    }

    // Verify candidate roster if roster verification is enabled
    const existingCandidate = await prisma.candidate.findUnique({
      where: { candidateCode: candidateCode.trim().toUpperCase() }
    })

    if (existingCandidate) {
      if (!existingCandidate.isEligible) {
        return NextResponse.json({
          success: false,
          error: `Mã thí sinh [${candidateCode}] đang bị tạm khóa quyền dự thi. Vui lòng liên hệ Ban Điều hành.`
        }, { status: 403 })
      }
    } else {
      // Auto-register candidate into database for official record
      await prisma.candidate.create({
        data: {
          candidateCode: candidateCode.trim().toUpperCase(),
          fullName: fullName.trim(),
          participantType,
          unitName: unitName.trim(),
          isEligible: true,
          notes: 'Đăng ký trực tiếp khi làm bài thi'
        }
      })
    }

    const explicitDevice = body.deviceFingerprint
    const deviceFingerprint = extractDeviceFingerprint(req, explicitDevice)

    // Check anti-cheat eligibility (Mã thí sinh + Máy/Thiết bị)
    const eligibility = await verifyExamAttemptEligibility(
      exam.id,
      candidateCode.trim().toUpperCase(),
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

    return NextResponse.json({
      success: true,
      message: 'Xác nhận thông tin thành công. Sẵn sàng vào thi!',
      exam: {
        id: exam.id,
        title: exam.title,
        slug: exam.slug,
        durationMinutes: exam.durationMinutes,
        totalQuestions: exam.totalQuestions,
        maxScore: exam.maxScore
      },
      candidate: {
        candidateCode: candidateCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        participantType,
        unitName: unitName.trim()
      }
    })
  } catch (error: any) {
    console.error('Candidate verify error:', error)
    return NextResponse.json({ success: false, error: 'Lỗi xác nhận thông tin thí sinh' }, { status: 500 })
  }
}
