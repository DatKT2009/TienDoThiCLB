import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import prisma from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'trongdong-youth-jwt-secret-key-2026'

export interface AdminPayload {
  userId: string
  username: string
  role: string
  fullName: string
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload
  } catch {
    return null
  }
}

export async function getAdminFromRequest(req: NextRequest | Request): Promise<AdminPayload | null> {
  let token = ''

  if ('headers' in req) {
    const authHeader = req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  // Also check cookie
  if (!token && 'cookies' in req) {
    const cookieToken = (req as NextRequest).cookies.get('admin_token')?.value
    if (cookieToken) token = cookieToken
  }

  if (!token) return null

  const decoded = verifyAdminToken(token)
  if (!decoded) return null

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  })

  if (!user) return null

  return {
    userId: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName
  }
}
