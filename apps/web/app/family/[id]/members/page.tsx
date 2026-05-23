'use client'

import { useState, use } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, Trash2, Shield, Eye, Edit3, Crown } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useFamily } from '@/hooks/useFamilies'
import { Avatar } from '@/components/ui/Avatar'
import { RoleBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { truncateAddress } from '@/lib/utils'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import toast from 'react-hot-toast'

export default function MembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { account } = useWallet()
  const { data: family } = useFamily(id)
  const qc = useQueryClient()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newWallet, setNewWallet] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<'VIEWER' | 'EDITOR' | 'HEIR'>('VIEWER')
  const [newRelation, setNewRelation] = useState('')

  const isOwner = account?.address?.toString() === family?.ownerWallet

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', id],
    queryFn: () => fetch(`/api/families/${id}/members`).then(r => r.json()),
    enabled: !!id,
  })

  const addMember = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/families/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: newWallet, name: newName, role: newRole, relation: newRelation }),
      })
      if (!res.ok) throw new Error()
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', id] })
      setShowAddModal(false)
      setNewWallet('')
      setNewName('')
      toast.success('Thêm thành viên thành công!')
    },
    onError: () => toast.error('Thêm thất bại'),
  })

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/families/${id}/members/${memberId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', id] })
      toast.success('Đã xóa thành viên')
    },
    onError: () => toast.error('Xóa thất bại'),
  })

  const roles = [
    { value: 'VIEWER', label: 'Người xem',  icon: Eye,    desc: 'Chỉ xem ký ức trong vault' },
    { value: 'EDITOR', label: 'Biên tập',   icon: Edit3,  desc: 'Upload và chỉnh sửa ký ức' },
    { value: 'HEIR',   label: 'Kế thừa',    icon: Shield, desc: 'Sẽ kế thừa vault khi cần' },
  ]

  return (
    <AppLayout familyId={id} familyName={family?.familyName}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold mb-0.5" style={{ color: 'var(--text-1)' }}>
              Thành viên gia đình
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              {members?.length || 0} thành viên trong vault này
            </p>
          </div>
          {isOwner && (
            <Button icon={<UserPlus size={15} />} onClick={() => setShowAddModal(true)}>
              Thêm thành viên
            </Button>
          )}
        </div>

        <div className="space-y-2.5">
          {isLoading ? (
            [1,2,3].map(i => <div key={i} className="skeleton h-[72px] rounded-xl" />)
          ) : members?.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Chưa có thành viên</h3>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>Mời người thân vào vault gia đình</p>
            </div>
          ) : members?.map((member: {
            id: string
            walletAddress: string
            name?: string
            role: string
            relation?: string
          }) => (
            <div key={member.id} className="card p-4 flex items-center gap-3.5 group animate-fade-in">
              <Avatar address={member.walletAddress} name={member.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-1)' }}>
                    {member.name || truncateAddress(member.walletAddress, 8)}
                  </span>
                  {member.role === 'OWNER' && (
                    <Crown size={12} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                  )}
                  <RoleBadge role={member.role} />
                </div>
                <div className="text-xs font-mono truncate" style={{ color: 'var(--text-3)' }}>
                  {member.walletAddress.slice(0, 22)}…
                </div>
                {member.relation && (
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{member.relation}</div>
                )}
              </div>
              {isOwner && member.role !== 'OWNER' && (
                <button
                  onClick={() => removeMember.mutate(member.id)}
                  className="btn-icon opacity-0 group-hover:opacity-100 transition-all"
                  style={{ '--tw-text-opacity': '1' } as React.CSSProperties}
                  title="Xóa thành viên"
                  aria-label="Xóa thành viên"
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
                    e.currentTarget.style.color = 'var(--red)'
                    e.currentTarget.style.background = 'var(--red-dim)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--text-3)'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Thêm thành viên mới">
        <div className="space-y-4">
          <div>
            <label className="input-label">Địa chỉ ví Aptos *</label>
            <input
              className="input"
              placeholder="0x…"
              value={newWallet}
              onChange={e => setNewWallet(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">Tên hiển thị</label>
            <input
              className="input"
              placeholder="Nguyễn Văn A…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">Quan hệ gia đình</label>
            <input
              className="input"
              placeholder="Bố, Mẹ, Con cái…"
              value={newRelation}
              onChange={e => setNewRelation(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label mb-2.5 block">Vai trò</label>
            <div className="space-y-2">
              {roles.map(r => {
                const Icon = r.icon
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setNewRole(r.value as 'VIEWER' | 'EDITOR' | 'HEIR')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                    style={{
                      border: `1px solid ${newRole === r.value ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                      background: newRole === r.value ? 'var(--indigo-dim)' : 'transparent',
                    }}
                  >
                    <Icon size={15} style={{ color: newRole === r.value ? 'var(--indigo-light)' : 'var(--text-3)', flexShrink: 0 }} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: newRole === r.value ? 'var(--text-1)' : 'var(--text-2)' }}>
                        {r.label}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-3)' }}>{r.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          <Button
            className="w-full mt-1"
            loading={addMember.isPending}
            disabled={!newWallet}
            onClick={() => addMember.mutate()}
            icon={<UserPlus size={15} />}
          >
            Thêm thành viên
          </Button>
        </div>
      </Modal>
    </AppLayout>
  )
}
