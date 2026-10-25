import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quyền Admin' }, { status: 401 })
    }

    const { lockId, reason } = await req.json()

    if (!lockId || !reason) {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng cung cấp mã khóa và lý do mở khóa ngoại lệ'
      }, { status: 400 })
    }

    const lock = await prisma.examAttemptLock.findUnique({
      where: { id: lockId }
    })

    if (!lock) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy bản ghi khóa' }, { status: 404 })
    }

    const updated = await prisma.examAttemptLock.update({
      where: { id: lockId },
      data: {
        status: 'RELEASED',
        releasedBy: admin.username,
        releaseReason: reason,
        releasedAt: new Date()
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: 'UNLOCK_ATTEMPT_LOCK',
        targetType: 'EXAM_ATTEMPT_LOCK',
        targetId: lockId,
        detailsJson: JSON.stringify({
          adminUser: admin.username,
          reason,
          lockType: lock.lockType,
          candidateCode: lock.candidateCode,
          ipFingerprint: lock.ipFingerprint
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Đã mở khóa ngoại lệ thành công!',
      lock: updated
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
