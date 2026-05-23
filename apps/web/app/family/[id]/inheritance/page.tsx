'use client'

import { useState, use } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Clock, Users, Plus, CheckCircle } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useFamily } from '@/hooks/useFamilies'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { truncateAddress, getTriggerLabel, formatDate } from '@/lib/utils'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import toast from 'react-hot-toast'

const triggerOptions = [
  {
    value: 'MANUAL_RELEASE',
    label: 'Trao quyền thủ công',
    icon: CheckCircle,
    desc: 'Bạn chủ động trao quyền khi muốn',
    color: 'var(--green)',
    bg: 'var(--green-dim)',
    border: 'rgba(34,197,94,0.2)',
  },
  {
    value: 'TIME_LOCK',
    label: 'Khóa thời gian',
    icon: Clock,
    desc: 'Sau năm X mà bạn không gia hạn, người kế thừa tự động mở quyền',
    color: 'var(--amber)',
    bg: 'var(--amber-dim)',
    border: 'rgba(245,158,11,0.2)',
  },
  {
    value: 'MULTI_MEMBER_APPROVAL',
    label: 'Xác nhận đa thành viên',
    icon: Users,
    desc: 'Khi đủ số thành viên xác nhận, quyền được trao',
    color: 'var(--indigo-light)',
    bg: 'var(--indigo-dim)',
    border: 'rgba(99,102,241,0.2)',
  },
]

export default function InheritancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { account } = useWallet()
  const { data: family } = useFamily(id)
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [heirWallet, setHeirWallet] = useState('')
  const [triggerType, setTriggerType] = useState('MANUAL_RELEASE')
  const [unlockYear, setUnlockYear] = useState(new Date().getFullYear() + 10)
  const [approvalCount, setApprovalCount] = useState(3)
  const [note, setNote] = useState('')

  const isOwner = account?.address?.toString() === family?.ownerWallet

  const { data: rules } = useQuery({
    queryKey: ['inheritance', id],
    queryFn: () => fetch(`/api/inheritance/rules?familyId=${id}`).then(r => r.json()),
    enabled: !!id,
  })

  const createRule = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/inheritance/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId: id, heirWallet, triggerType,
          unlockYear: triggerType === 'TIME_LOCK' ? unlockYear : undefined,
          approvalCount: triggerType === 'MULTI_MEMBER_APPROVAL' ? approvalCount : undefined,
          note,
        }),
      })
      if (!res.ok) throw new Error()
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inheritance', id] })
      setShowModal(false)
      setHeirWallet('')
      toast.success('Tạo quy tắc kế thừa thành công!')
    },
    onError: () => toast.error('Tạo thất bại'),
  })

  return (
    <AppLayout familyId={id} familyName={family?.familyName}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
          <div>
            <h1
              className="font-display text-xl sm:text-2xl font-bold mb-0.5 flex items-center gap-2"
              style={{ color: 'var(--text-1)' }}
            >
              <Shield size={22} style={{ color: 'var(--indigo-light)' }} />
              Kế thừa ký ức
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              Thiết lập quy tắc truyền lại vault cho thế hệ sau
            </p>
          </div>
          {isOwner && (
            <Button icon={<Plus size={14} />} onClick={() => setShowModal(true)}>
              Tạo quy tắc
            </Button>
          )}
        </div>

        {/* Trigger type overview */}
        <div className="grid grid-cols-1 gap-3 mb-7">
          {triggerOptions.map(opt => {
            const Icon = opt.icon
            return (
              <div
                key={opt.value}
                className="card p-4 flex items-start gap-3.5"
                style={{ borderColor: opt.border }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: opt.bg }}
                >
                  <Icon size={16} style={{ color: opt.color }} />
                </div>
                <div>
                  <div className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-1)' }}>{opt.label}</div>
                  <div className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{opt.desc}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Rules list */}
        {rules && rules.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>
              Quy tắc đã thiết lập
            </h3>
            {rules.map((rule: {
              id: string
              heirWallet: string
              triggerType: string
              status: string
              unlockYear?: number
              note?: string
              createdAt: string
            }) => (
              <div key={rule.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar address={rule.heirWallet} size="md" />
                    <div>
                      <div className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-1)' }}>
                        Người kế thừa: {truncateAddress(rule.heirWallet, 8)}
                      </div>
                      <div className="text-xs mb-0.5" style={{ color: 'var(--text-2)' }}>
                        {getTriggerLabel(rule.triggerType)}
                      </div>
                      {rule.unlockYear && (
                        <div className="text-xs" style={{ color: 'var(--amber)' }}>Mở khóa năm: {rule.unlockYear}</div>
                      )}
                      {rule.note && (
                        <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{rule.note}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`badge ${rule.status === 'ACTIVE' ? 'badge-emerald' : 'badge-slate'}`}>
                      {rule.status === 'ACTIVE' ? 'Hoạt động' : rule.status === 'CLAIMED' ? 'Đã nhận quyền' : rule.status}
                    </span>
                    {account?.address?.toString() === rule.heirWallet && rule.status === 'ACTIVE' && (
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/inheritance/claim', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ ruleId: rule.id })
                            })
                            if (!res.ok) {
                              const data = await res.json()
                              throw new Error(data.error || 'Lỗi nhận quyền')
                            }
                            toast.success('Đã nhận quyền kế thừa thành công!')
                            qc.invalidateQueries({ queryKey: ['inheritance', id] })
                          } catch (e: unknown) {
                            toast.error((e as Error).message)
                          }
                        }}
                      >
                        Nhận quyền
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-10 sm:p-12 text-center animate-scale-in">
            <Shield size={40} className="mx-auto mb-3" style={{ color: 'var(--text-4)' }} />
            <h3 className="font-semibold mb-1.5" style={{ color: 'var(--text-1)' }}>Chưa có quy tắc kế thừa</h3>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              Thiết lập quy tắc để vault được truyền lại cho thế hệ sau
            </p>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tạo quy tắc kế thừa">
        <div className="space-y-4">
          <div>
            <label className="input-label">Địa chỉ ví người kế thừa *</label>
            <input
              className="input"
              placeholder="0x…"
              value={heirWallet}
              onChange={e => setHeirWallet(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label mb-2.5 block">Loại kích hoạt</label>
            <div className="space-y-2">
              {triggerOptions.map(opt => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTriggerType(opt.value)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                    style={{
                      border: `1px solid ${triggerType === opt.value ? opt.border : 'var(--border)'}`,
                      background: triggerType === opt.value ? opt.bg : 'transparent',
                    }}
                  >
                    <Icon size={15} style={{ color: triggerType === opt.value ? opt.color : 'var(--text-3)', flexShrink: 0 }} />
                    <div className="text-sm font-medium" style={{ color: triggerType === opt.value ? 'var(--text-1)' : 'var(--text-2)' }}>
                      {opt.label}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {triggerType === 'TIME_LOCK' && (
            <div>
              <label className="input-label">Năm mở khóa</label>
              <input type="number" className="input" value={unlockYear} onChange={e => setUnlockYear(Number(e.target.value))} />
            </div>
          )}
          {triggerType === 'MULTI_MEMBER_APPROVAL' && (
            <div>
              <label className="input-label">Số thành viên cần xác nhận</label>
              <input type="number" min={2} className="input" value={approvalCount} onChange={e => setApprovalCount(Number(e.target.value))} />
            </div>
          )}

          <div>
            <label className="input-label">Ghi chú (tùy chọn)</label>
            <textarea className="input resize-none" rows={2} value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <Button
            className="w-full"
            loading={createRule.isPending}
            disabled={!heirWallet}
            onClick={() => createRule.mutate()}
            icon={<Shield size={15} />}
          >
            Tạo quy tắc kế thừa
          </Button>
        </div>
      </Modal>
    </AppLayout>
  )
}
