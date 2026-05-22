'use client'

import { useState, use } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, Trash2, Shield, Eye, Edit3 } from 'lucide-react'
import { FamilySidebar } from '@/components/layout/Sidebar'
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
      toast.success('Them thanh vien thanh cong!')
    },
    onError: () => toast.error('Them that bai'),
  })

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/families/${id}/members/${memberId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', id] })
      toast.success('Da xoa thanh vien')
    },
    onError: () => toast.error('Xoa that bai'),
  })

  const roles = [
    { value: 'VIEWER', label: 'Nguoi xem', icon: Eye, desc: 'Chi xem ky uc' },
    { value: 'EDITOR', label: 'Bien tap', icon: Edit3, desc: 'Upload va chinh sua' },
    { value: 'HEIR', label: 'Ke thua', icon: Shield, desc: 'Se ke thua vault' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <FamilySidebar familyId={id} familyName={family?.familyName} />

      <main className="ml-60 pt-16">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-white mb-1">Thanh vien gia dinh</h1>
              <p className="text-slate-400 text-sm">{members?.length || 0} thanh vien trong vault nay</p>
            </div>
            {isOwner && (
              <Button icon={<UserPlus size={16} />} onClick={() => setShowAddModal(true)}>
                Them thanh vien
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {isLoading ? (
              [1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)
            ) : members?.map((member: { id: string; walletAddress: string; name?: string; role: string; relation?: string }) => (
              <div key={member.id} className="glass rounded-2xl p-5 flex items-center gap-4">
                <Avatar address={member.walletAddress} name={member.name} size="md" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">
                      {member.name || truncateAddress(member.walletAddress, 8)}
                    </span>
                    <RoleBadge role={member.role} />
                  </div>
                  <div className="text-xs text-slate-500 font-mono">{member.walletAddress.slice(0, 20)}...</div>
                  {member.relation && <div className="text-xs text-slate-400 mt-0.5">{member.relation}</div>}
                </div>
                {isOwner && member.role !== 'OWNER' && (
                  <button
                    onClick={() => removeMember.mutate(member.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Them thanh vien moi">
        <div className="space-y-4">
          <div>
            <label className="input-label">Dia chi vi Aptos *</label>
            <input className="input" placeholder="0x..." value={newWallet} onChange={e => setNewWallet(e.target.value)} />
          </div>
          <div>
            <label className="input-label">Ten hien thi</label>
            <input className="input" placeholder="Nguyen Van A..." value={newName} onChange={e => setNewName(e.target.value)} />
          </div>
          <div>
            <label className="input-label">Quan he gia dinh</label>
            <input className="input" placeholder="Bo, Me, Con cai..." value={newRelation} onChange={e => setNewRelation(e.target.value)} />
          </div>
          <div>
            <label className="input-label mb-3 block">Vai tro</label>
            <div className="space-y-2">
              {roles.map(r => {
                const Icon = r.icon
                return (
                  <button key={r.value} type="button" onClick={() => setNewRole(r.value as 'VIEWER' | 'EDITOR' | 'HEIR')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                      newRole === r.value ? 'bg-indigo-500/15 border-indigo-500/30 text-white' : 'border-white/5 text-slate-400 hover:border-white/10'
                    }`}>
                    <Icon size={16} />
                    <div>
                      <div className="text-sm font-medium">{r.label}</div>
                      <div className="text-xs text-slate-500">{r.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          <Button className="w-full mt-2" loading={addMember.isPending} disabled={!newWallet} onClick={() => addMember.mutate()} icon={<UserPlus size={16} />}>
            Them thanh vien
          </Button>
        </div>
      </Modal>
    </div>
  )
}
