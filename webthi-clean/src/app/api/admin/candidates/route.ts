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
    const query = searchParams.get('q')
    const type = searchParams.get('type')

    const where: any = {}
    if (type && type !== 'ALL') {
      where.participantType = type
    }
    if (query) {
      where.OR = [
        { candidateCode: { contains: query } },
        { fullName: { contains: query } },
        { unitName: { contains: query } }
      ]
    }

    const candidates = await prisma.candidate.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, candidates })
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
    const { candidateCode, fullName, participantType, unitName, isEligible = true, notes } = body

    if (!candidateCode || !fullName) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập mã và họ tên' }, { status: 400 })
    }

    const candidate = await prisma.candidate.upsert({
      where: { candidateCode: candidateCode.trim().toUpperCase() },
      update: {
        fullName: fullName.trim(),
        participantType: participantType || 'CTV',
        unitName: unitName?.trim() || 'CLB',
        isEligible: Boolean(isEligible),
        notes: notes || null
      },
      create: {
        candidateCode: candidateCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        participantType: participantType || 'CTV',
        unitName: unitName?.trim() || 'CLB',
        isEligible: Boolean(isEligible),
        notes: notes || null
      }
    })

    return NextResponse.json({ success: true, candidate })
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
    const { id, isEligible, notes } = body

    const updated = await prisma.candidate.update({
      where: { id },
      data: {
        ...(isEligible !== undefined && { isEligible: Boolean(isEligible) }),
        ...(notes !== undefined && { notes })
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: 'UPDATE_CANDIDATE_ELIGIBILITY',
        targetType: 'CANDIDATE',
        targetId: id,
        detailsJson: JSON.stringify({ isEligible, notes })
      }
    })

    return NextResponse.json({ success: true, candidate: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
