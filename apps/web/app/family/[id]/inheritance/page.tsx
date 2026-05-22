'use client'

import { useState, use } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Clock, Users, Plus, CheckCircle } from 'lucide-react'
import { FamilySidebar } from '@/components/layout/Sidebar'
import { useFamily } from '@/hooks/useFamilies'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { truncateAddress, getTriggerLabel, formatDate } from '@/lib/utils'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import toast from 'react-hot-toast'

const triggerOptions = [
  { value: 'MANUAL_RELEASE', label: 'Trao quyen thu cong', icon: CheckCircle, desc: 'Ban chu dong trao quyen khi muon', color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },
  { value: 'TIME_LOCK', label: 'Khoa thoi gian', icon: Clock, desc: 'Sau nam X ma ban khong gia han, nguoi ke thua tu dong mo quyen', color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
  { value: 'MULTI_MEMBER_APPROVAL', label: 'Xac nhan da thanh vien', icon: Users, desc: 'Khi du so thanh vien xac nhan, quyen duoc trao', color: 'text-indigo-400', bg: 'rgba(99,102,241,0.1)' },
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
        body: JSON.stringify({ familyId: id, heirWallet, triggerType, unlockYear: triggerType === 'TIME_LOCK' ? unlockYear : undefined, approvalCount: triggerType === 'MULTI_MEMBER_APPROVAL' ? approvalCount : undefined, note }),
      })
      if (!res.ok) throw new Error()
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inheritance', id] })
      setShowModal(false)
      setHeirWallet('')
      toast.success('Tao quy tac ke thua thanh cong!')
    },
    onError: () => toast.error('Tao that bai'),
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <FamilySidebar familyId={id} familyName={family?.familyName} />
      <main className="ml-60 pt-16">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-white mb-2 flex items-center gap-2"><Shield className="text-indigo-400" size={24} /> Ke thua ky uc</h1>
              <p className="text-slate-400">Thiet lap quy tac truyen lai vault cho the he sau</p>
            </div>
            {isOwner && <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>Tao quy tac</Button>}
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
            {triggerOptions.map(opt => {
              const Icon = opt.icon
              return (
                <div key={opt.value} className="glass rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: opt.bg }}>
                    <Icon size={18} className={opt.color} />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm mb-1">{opt.label}</div>
                    <div className="text-xs text-slate-400">{opt.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {rules && rules.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-bold text-white">Quy tac da thiet lap</h3>
              {rules.map((rule: { id: string; heirWallet: string; triggerType: string; status: string; unlockYear?: number; note?: string; createdAt: string }) => (
                <div key={rule.id} className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar address={rule.heirWallet} size="sm" />
                      <div>
                        <div className="text-sm font-medium text-white">Nguoi ke thua: {truncateAddress(rule.heirWallet, 8)}</div>
                        <div className="text-xs text-slate-400">{getTriggerLabel(rule.triggerType)}</div>
                        {rule.unlockYear && <div className="text-xs text-amber-400">Mo khoa nam: {rule.unlockYear}</div>}
                        {rule.note && <div className="text-xs text-slate-500 mt-1">{rule.note}</div>}
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
                            } catch (e: any) {
                              toast.error(e.message)
                            }
                          }}
                        >
                          Nhận quyền thừa kế
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass rounded-2xl">
              <Shield size={48} className="text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Chua co quy tac ke thua</h3>
              <p className="text-slate-400 text-sm">Thiet lap quy tac de vault duoc truyen lai cho the he sau</p>
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tao quy tac ke thua">
        <div className="space-y-4">
          <div>
            <label className="input-label">Dia chi vi nguoi ke thua *</label>
            <input className="input" placeholder="0x..." value={heirWallet} onChange={e => setHeirWallet(e.target.value)} />
          </div>
          <div>
            <label className="input-label mb-3 block">Loai kich hoat</label>
            <div className="space-y-2">
              {triggerOptions.map(opt => {
                const Icon = opt.icon
                return (
                  <button key={opt.value} type="button" onClick={() => setTriggerType(opt.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                      triggerType === opt.value ? 'bg-indigo-500/15 border-indigo-500/30' : 'border-white/5 hover:border-white/10'
                    }`}>
                    <Icon size={16} className={opt.color} />
                    <div>
                      <div className={`text-sm font-medium ${triggerType === opt.value ? 'text-white' : 'text-slate-400'}`}>{opt.label}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          {triggerType === 'TIME_LOCK' && (
            <div>
              <label className="input-label">Nam mo khoa</label>
              <input type="number" className="input" value={unlockYear} onChange={e => setUnlockYear(Number(e.target.value))} />
            </div>
          )}
          {triggerType === 'MULTI_MEMBER_APPROVAL' && (
            <div>
              <label className="input-label">So thanh vien can xac nhan</label>
              <input type="number" min={2} className="input" value={approvalCount} onChange={e => setApprovalCount(Number(e.target.value))} />
            </div>
          )}
          <div>
            <label className="input-label">Ghi chu (tuy chon)</label>
            <textarea className="input resize-none" rows={2} value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <Button className="w-full" loading={createRule.isPending} disabled={!heirWallet} onClick={() => createRule.mutate()} icon={<Shield size={16} />}>
            Tao quy tac ke thua
          </Button>
        </div>
      </Modal>
    </div>
  )
}
