import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quyền Admin' }, { status: 401 })
    }

    const settings = await prisma.systemSetting.findMany()
    const settingsMap: Record<string, string> = {}
    for (const s of settings) {
      settingsMap[s.key] = s.value
    }

    // Mask sensitive keys when returning to admin UI for security
    const maskedSettings = {
      ...settingsMap,
      GEMINI_API_KEY: settingsMap.GEMINI_API_KEY ? '••••••••' + settingsMap.GEMINI_API_KEY.slice(-4) : '',
      GOOGLE_PRIVATE_KEY: settingsMap.GOOGLE_PRIVATE_KEY ? '••••[ĐÃ LƯU PRIVATE KEY]••••' : ''
    }

    return NextResponse.json({ success: true, settings: maskedSettings, rawKeys: Object.keys(settingsMap) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quyền Admin' }, { status: 401 })
    }

    const body = await req.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ success: false, error: 'Dữ liệu cài đặt không hợp lệ' }, { status: 400 })
    }

    for (const [key, value] of Object.entries(settings)) {
      // Don't overwrite if value is masked placeholder
      if (typeof value === 'string' && value.startsWith('••••')) {
        continue
      }

      await prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: 'UPDATE_SYSTEM_SETTINGS',
        targetType: 'SYSTEM_SETTINGS',
        detailsJson: JSON.stringify({ keysUpdated: Object.keys(settings) })
      }
    })

    return NextResponse.json({ success: true, message: 'Đã lưu cấu hình hệ thống thành công!' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
