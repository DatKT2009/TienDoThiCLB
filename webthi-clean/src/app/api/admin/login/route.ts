import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signAdminToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập tên đăng nhập và mật khẩu' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'Tài khoản hoặc mật khẩu không chính xác' }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Tài khoản hoặc mật khẩu không chính xác' }, { status: 401 })
    }

    const token = signAdminToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName
    })

    const response = NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      },
      token
    })

    // Set HttpOnly cookie for web security
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax'
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, error: 'Lỗi xử lý đăng nhập' }, { status: 500 })
  }
}
