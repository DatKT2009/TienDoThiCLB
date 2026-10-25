import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { retryPendingSyncJobs, getStatisticsSummary } from '@/services/google-sheets'

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập quyền Admin' }, { status: 401 })
    }

    const retryResults = await retryPendingSyncJobs()
    const stats = await getStatisticsSummary()

    return NextResponse.json({
      success: true,
      message: `Đã kích hoạt đồng bộ ${retryResults.length} bản ghi sang Google Sheets.`,
      retriedCount: retryResults.length,
      stats
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
