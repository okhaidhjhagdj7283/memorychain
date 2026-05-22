import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import prisma from '@memorychain/db'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const { ruleId } = await req.json()
    if (!ruleId) return NextResponse.json({ error: 'Thiếu ruleId' }, { status: 400 })

    const rule = await prisma.inheritanceRule.findUnique({
      where: { id: ruleId },
      include: { family: true },
    })

    if (!rule) return NextResponse.json({ error: 'Không tìm thấy quy tắc' }, { status: 404 })
    if (rule.heirWallet !== session.walletAddress) {
      return NextResponse.json({ error: 'Bạn không phải người kế thừa của quy tắc này' }, { status: 403 })
    }
    if (rule.status !== 'ACTIVE') {
      return NextResponse.json({ error: `Quy tắc không ở trạng thái ACTIVE (hiện tại: ${rule.status})` }, { status: 400 })
    }

    // Kiểm tra điều kiện (Mock logic cho MVP)
    const currentYear = new Date().getFullYear()
    if (rule.triggerType === 'TIME_LOCK' && rule.unlockYear && currentYear < rule.unlockYear) {
      return NextResponse.json({ error: `Chưa đến năm mở khóa (${rule.unlockYear})` }, { status: 400 })
    }
    // Đối với MULTI_MEMBER_APPROVAL và MANUAL_RELEASE, thực tế cần logic phức tạp hơn
    // Tuy nhiên theo flow MVP, ta tạm cho phép claim nếu status là ACTIVE (đã được duyệt).

    // Chuyển quyền:
    // 1. Cập nhật status của rule thành CLAIMED
    await prisma.inheritanceRule.update({
      where: { id: rule.id },
      data: { status: 'CLAIMED' },
    })

    // 2. Thêm heir vào familyMembers với role OWNER
    await prisma.familyMember.upsert({
      where: { familyId_walletAddress: { familyId: rule.familyId, walletAddress: rule.heirWallet } },
      update: { role: 'OWNER' },
      create: {
        familyId: rule.familyId,
        walletAddress: rule.heirWallet,
        role: 'OWNER',
        name: 'Người kế thừa',
      },
    })

    // 3. Đổi ownerWallet của Family (tùy chọn theo design, có thể giữ nguyên owner cũ nhưng thêm owner mới)
    await prisma.family.update({
      where: { id: rule.familyId },
      data: { ownerWallet: rule.heirWallet },
    })

    // Log
    await prisma.activityLog.create({
      data: {
        walletAddress: session.walletAddress,
        familyId: rule.familyId,
        action: 'CLAIM_INHERITANCE',
        resourceId: rule.id,
        resourceType: 'inheritance_rule',
      },
    })

    return NextResponse.json({ success: true, message: 'Đã nhận quyền kế thừa vault' }, { status: 200 })
  } catch (err) {
    console.error('[Inheritance/Claim/POST]', err)
    return NextResponse.json({ error: 'Lỗi server khi claim' }, { status: 500 })
  }
}
