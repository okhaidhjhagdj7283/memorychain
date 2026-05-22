'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GitBranch } from 'lucide-react'
import { FamilySidebar } from '@/components/layout/Sidebar'
import { useFamily } from '@/hooks/useFamilies'
import { Avatar } from '@/components/ui/Avatar'
import { RoleBadge } from '@/components/ui/Badge'
import { truncateAddress } from '@/lib/utils'

export default function FamilyTreePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: family } = useFamily(id)

  const { data: members } = useQuery({
    queryKey: ['members', id],
    queryFn: () => fetch(`/api/families/${id}/members`).then(r => r.json()),
    enabled: !!id,
  })

  const owner = members?.find((m: { role: string }) => m.role === 'OWNER')
  const others = members?.filter((m: { role: string }) => m.role !== 'OWNER') || []

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <FamilySidebar familyId={id} familyName={family?.familyName} />
      <main className="ml-60 pt-16">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <GitBranch className="text-indigo-400" size={24} /> Cay gia pha
            </h1>
            <p className="text-slate-400">So do quan he cac thanh vien trong vault {family?.familyName}</p>
          </div>
          <div className="glass rounded-3xl p-10 min-h-96">
            {members && members.length > 0 ? (
              <div className="flex flex-col items-center">
                {owner && <div className="mb-8"><MemberNode member={owner} isOwner /></div>}
                {others.length > 0 && (
                  <>
                    <div className="w-px h-8 bg-indigo-500/30" />
                    <div className="flex gap-8 flex-wrap justify-center">
                      {others.map((member: { id: string; walletAddress: string; name?: string; role: string; relation?: string }) => (
                        <div key={member.id} className="flex flex-col items-center">
                          <div className="w-px h-8 bg-indigo-500/30 mb-4" />
                          <MemberNode member={member} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <GitBranch size={48} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Chua co thanh vien nao trong vault</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function MemberNode({ member, isOwner }: { member: { walletAddress: string; name?: string; role: string; relation?: string }; isOwner?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-3 p-5 rounded-2xl transition-all ${
      isOwner ? 'bg-indigo-500/15 border-2 border-indigo-500/40' : 'glass'
    }`} style={{ minWidth: 140 }}>
      <Avatar address={member.walletAddress} name={member.name} size="lg" />
      <div className="text-center">
        <div className="font-semibold text-white text-sm">{member.name || truncateAddress(member.walletAddress)}</div>
        {member.relation && <div className="text-xs text-slate-400">{member.relation}</div>}
        <div className="mt-1"><RoleBadge role={member.role} /></div>
      </div>
    </div>
  )
}
