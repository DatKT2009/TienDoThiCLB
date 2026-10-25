import crypto from 'crypto'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

const IP_SECRET = process.env.IP_HMAC_SECRET || 'trongdong-default-hmac-secret-salt-2026'

/**
 * Extracts and normalizes client IP address from Next.js request.
 */
export function extractClientIp(req: NextRequest | Request): string {
  let ip = ''
  
  if ('headers' in req) {
    const headers = req.headers
    const cfIp = headers.get('cf-connecting-ip')
    const xRealIp = headers.get('x-real-ip')
    const xForwardedFor = headers.get('x-forwarded-for')

    if (cfIp) {
      ip = cfIp.trim()
    } else if (xRealIp) {
      ip = xRealIp.trim()
    } else if (xForwardedFor) {
      ip = xForwardedFor.split(',')[0].trim()
    }
  }

  // Fallback to loopback if in local environment
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    ip = '127.0.0.1'
  }

  // Normalize IPv6 mapped IPv4 (e.g. ::ffff:192.168.1.1)
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '')
  }

  return ip
}

/**
 * Extracts Device / Machine Fingerprint from Request (IP máy / Định danh phần cứng của máy)
 */
export function extractDeviceFingerprint(req: NextRequest | Request, explicitDevice?: string): string {
  if (explicitDevice && explicitDevice.trim().length > 3) {
    return explicitDevice.trim()
  }

  if ('headers' in req) {
    const headerDev = req.headers.get('x-device-fingerprint')
    if (headerDev && headerDev.trim().length > 3) {
      return headerDev.trim()
    }
  }

  // Check cookie if available
  if ('cookies' in req) {
    const cookieDev = (req as NextRequest).cookies.get('trongdong_machine_id')?.value
    if (cookieDev) {
      return `DEV-${cookieDev.slice(0, 16)}`
    }
  }

  return 'DEV-DEFAULT'
}

/**
 * Creates an HMAC-SHA256 fingerprint
 */
export function createIpFingerprint(identifier: string): string {
  return crypto
    .createHmac('sha256', IP_SECRET)
    .update(identifier.trim().toLowerCase())
    .digest('hex')
}

export interface CheckAttemptResult {
  allowed: boolean
  blockedReason?: string
  blockedType?: 'CANDIDATE' | 'DEVICE' | 'IP' | 'POLICY'
}

/**
 * Verifies if candidate and device/IP are allowed to take the exam.
 * Hỗ trợ phân biệt: "IP máy / Thiết bị máy" và "IP mạng (Wi-Fi)".
 */
export async function verifyExamAttemptEligibility(
  examId: string,
  candidateCode: string,
  clientIp: string,
  deviceFingerprint: string = 'DEV-DEFAULT'
): Promise<CheckAttemptResult> {
  const exam = await prisma.exam.findUnique({
    where: { id: examId }
  })

  if (!exam) {
    return { allowed: false, blockedReason: 'Kỳ thi không tồn tại trong hệ thống.' }
  }

  const now = new Date()
  if (exam.status !== 'ACTIVE') {
    return { allowed: false, blockedReason: 'Kỳ thi hiện không ở trạng thái mở làm bài.' }
  }

  if (now < exam.startTime) {
    return { allowed: false, blockedReason: `Kỳ thi chưa bắt đầu. Thời gian mở: ${exam.startTime.toLocaleString('vi-VN')}` }
  }

  if (now > exam.endTime) {
    return { allowed: false, blockedReason: `Kỳ thi đã kết thúc vào: ${exam.endTime.toLocaleString('vi-VN')}` }
  }

  const policy = exam.oneAttemptPolicy || 'CANDIDATE_AND_DEVICE'
  const isLocalhost = clientIp === '127.0.0.1' || clientIp === '::1'

  // 1. Kiểm tra Lớp 1: Mã thí sinh (Mỗi mã thí sinh chỉ thi 1 lần)
  if (
    policy === 'CANDIDATE_ONLY' ||
    policy === 'CANDIDATE_AND_DEVICE' ||
    policy === 'CANDIDATE_AND_IP'
  ) {
    const candidateLock = await prisma.examAttemptLock.findFirst({
      where: {
        examId,
        candidateCode,
        lockType: 'CANDIDATE',
        status: 'ACTIVE'
      }
    })

    if (candidateLock) {
      return {
        allowed: false,
        blockedType: 'CANDIDATE',
        blockedReason: `Mã thí sinh [${candidateCode}] đã nộp bài hoặc đang có lượt thi cho kỳ thi này. Mỗi thí sinh chỉ được tham gia 01 lần.`
      }
    }

    const existingSubmission = await prisma.submission.findFirst({
      where: {
        examId,
        candidateCode
      }
    })

    if (existingSubmission) {
      return {
        allowed: false,
        blockedType: 'CANDIDATE',
        blockedReason: `Mã thí sinh [${candidateCode}] đã hoàn thành bài thi này vào lúc ${existingSubmission.submittedAt?.toLocaleString('vi-VN') || 'trước đó'}.`
      }
    }
  }

  // 2. Kiểm tra Lớp 2: Khóa theo Thiết bị / Máy tính (IP máy)
  if (policy === 'CANDIDATE_AND_DEVICE' || policy === 'DEVICE_ONLY') {
    if (deviceFingerprint && deviceFingerprint !== 'DEV-DEFAULT') {
      const deviceHash = createIpFingerprint(deviceFingerprint)

      const deviceLock = await prisma.examAttemptLock.findFirst({
        where: {
          examId,
          ipFingerprint: deviceHash,
          lockType: 'DEVICE',
          status: 'ACTIVE'
        }
      })

      if (deviceLock && deviceLock.candidateCode !== candidateCode) {
        return {
          allowed: false,
          blockedType: 'DEVICE',
          blockedReason: 'Thiết bị (máy tính/điện thoại) này đã được sử dụng để nộp bài thi cho một thí sinh khác. Mỗi máy chỉ được sử dụng 01 lượt thi. Nếu bạn cần hỗ trợ, vui lòng liên hệ Ban Điều hành.'
        }
      }
    }
  }

  // 3. Kiểm tra Lớp 3: Khóa theo IP Mạng (chỉ khi quản trị viên chọn chính sách khóa toàn mạng Wi-Fi và không phải localhost)
  if ((policy === 'CANDIDATE_AND_IP' || policy === 'IP_ONLY') && !isLocalhost) {
    const ipFingerprint = createIpFingerprint(clientIp)

    const ipLock = await prisma.examAttemptLock.findFirst({
      where: {
        examId,
        ipFingerprint,
        lockType: 'IP',
        status: 'ACTIVE'
      }
    })

    if (ipLock && ipLock.candidateCode !== candidateCode) {
      return {
        allowed: false,
        blockedType: 'IP',
        blockedReason: 'Địa chỉ mạng này đã được sử dụng để tham gia kỳ thi. Nếu bạn cho rằng có nhầm lẫn do sử dụng chung Wi-Fi hoặc mạng nội bộ, vui lòng liên hệ Ban Điều hành để được hỗ trợ.'
      }
    }
  }

  return { allowed: true }
}

/**
 * Atomically acquires attempt locks for Candidate & Machine Device
 */
export async function acquireAttemptLocks(
  examId: string,
  candidateCode: string,
  clientIp: string,
  deviceFingerprint: string = 'DEV-DEFAULT'
): Promise<{ success: boolean; error?: string }> {
  const ipFingerprint = createIpFingerprint(clientIp)
  const deviceHash = createIpFingerprint(deviceFingerprint)

  try {
    await prisma.$transaction(async (tx) => {
      // Create candidate lock
      await tx.examAttemptLock.create({
        data: {
          examId,
          candidateCode,
          lockType: 'CANDIDATE',
          status: 'ACTIVE'
        }
      })

      // Create machine / device lock
      if (deviceFingerprint && deviceFingerprint !== 'DEV-DEFAULT') {
        await tx.examAttemptLock.create({
          data: {
            examId,
            candidateCode,
            ipFingerprint: deviceHash,
            lockType: 'DEVICE',
            status: 'ACTIVE'
          }
        })
      }

      // Create IP lock (if not localhost)
      if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
        await tx.examAttemptLock.create({
          data: {
            examId,
            candidateCode,
            ipFingerprint,
            lockType: 'IP',
            status: 'ACTIVE'
          }
        })
      }
    })

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể tạo phiên dự thi.' }
  }
}

/**
 * Admin action to unlock candidate, device or IP with full audit logging
 */
export async function unlockAttemptException(
  lockId: string,
  adminUsername: string,
  reason: string
) {
  const updated = await prisma.examAttemptLock.update({
    where: { id: lockId },
    data: {
      status: 'RELEASED',
      releasedBy: adminUsername,
      releaseReason: reason,
      releasedAt: new Date()
    }
  })

  await prisma.auditLog.create({
    data: {
      userId: null,
      action: 'UNLOCK_ATTEMPT',
      targetType: 'EXAM_ATTEMPT_LOCK',
      targetId: lockId,
      detailsJson: JSON.stringify({
        releasedBy: adminUsername,
        reason,
        candidateCode: updated.candidateCode,
        lockType: updated.lockType
      })
    }
  })

  return updated
}
