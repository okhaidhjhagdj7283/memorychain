'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GitBranch, Crown } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useFamily } from '@/hooks/useFamilies'
import { Avatar } from '@/components/ui/Avatar'
import { RoleBadge } from '@/components/ui/Badge'
import { truncateAddress } from '@/lib/utils'

export default function FamilyTreePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: family } = useFamily(id)

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', id],
    queryFn: () => fetch(`/api/families/${id}/members`).then(r => r.json()),
    enabled: !!id,
  })

  const owner  = members?.find((m: { role: string }) => m.role === 'OWNER')
  const others = members?.filter((m: { role: string }) => m.role !== 'OWNER') || []

  return (
    <AppLayout familyId={id} familyName={family?.familyName}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <div className="mb-6">
          <h1
            className="font-display text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2"
            style={{ color: 'var(--text-1)' }}
          >
            <GitBranch size={22} style={{ color: 'var(--indigo-light)' }} />
            Cây gia phả
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Sơ đồ quan hệ các thành viên trong vault {family?.familyName}
          </p>
        </div>

        <div
          className="card p-6 sm:p-10 min-h-80"
          style={{ border: '1px solid rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.02)' }}
        >
          {isLoading ? (
            <div className="flex justify-center pt-10">
              <div className="skeleton w-32 h-40 rounded-xl" />
            </div>
          ) : members && members.length > 0 ? (
            <div className="flex flex-col items-center">
              {/* Owner */}
              {owner && (
                <div className="mb-6">
                  <MemberNode member={owner} isOwner />
                </div>
              )}

              {/* Connector + children */}
              {others.length > 0 && (
                <>
                  <div className="w-px h-6 mb-0" style={{ background: 'rgba(99,102,241,0.3)' }} />
                  {/* Horizontal connector */}
                  {others.length > 1 && (
                    <div
                      className="h-px mb-0"
                      style={{
                        width: `${Math.min(others.length * 180, 680)}px`,
                        background: 'rgba(99,102,241,0.25)',
                      }}
                    />
                  )}
                  <div className="flex gap-6 sm:gap-8 flex-wrap justify-center">
                    {others.map((member: {
                      id: string
                      walletAddress: string
                      name?: string
                      role: string
                      relation?: string
                    }) => (
                      <div key={member.id} className="flex flex-col items-center">
                        <div className="w-px h-6" style={{ background: 'rgba(99,102,241,0.25)' }} />
                        <MemberNode member={member} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <GitBranch size={44} className="mx-auto mb-4" style={{ color: 'var(--text-4)' }} />
              <p style={{ color: 'var(--text-3)' }}>Chưa có thành viên nào trong vault</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

function MemberNode({
  member,
  isOwner,
}: {
  member: { walletAddress: string; name?: string; role: string; relation?: string }
  isOwner?: boolean
}) {
  return (
    <div
      className="flex flex-col items-center gap-2.5 p-4 rounded-xl transition-all"
      style={{
        minWidth: 120,
        background: isOwner ? 'var(--indigo-dim)' : 'var(--bg-elevated)',
        border: `1px solid ${isOwner ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
      }}
    >
      <div className="relative">
        <Avatar address={member.walletAddress} name={member.name} size="lg" />
        {isOwner && (
          <div
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: 'var(--amber)' }}
          >
            <Crown size={10} className="text-white" />
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="font-semibold text-xs sm:text-sm mb-0.5" style={{ color: 'var(--text-1)' }}>
          {member.name || truncateAddress(member.walletAddress, 6)}
        </div>
        {member.relation && (
          <div className="text-xs mb-1" style={{ color: 'var(--text-2)' }}>{member.relation}</div>
        )}
        <RoleBadge role={member.role} />
      </div>
    </div>
  )
}
