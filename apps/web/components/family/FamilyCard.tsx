'use client'

import Link from 'next/link'
import { Users, Image, Lock, Globe, Users2 } from 'lucide-react'
import { Family } from '@/types'
import { formatDate } from '@/lib/utils'
import { PrivacyBadge } from '@/components/ui/Badge'

export function FamilyCard({ family }: { family: Family }) {
  const memberCount = family._count?.members || 0
  const memoryCount = family._count?.memories || 0

  return (
    <Link href={`/family/${family.id}`} className="block no-underline group">
      <div className="glass rounded-2xl p-6 transition-all duration-300 group-hover:border-indigo-500/30 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-indigo-500/10">
        {/* Cover */}
        <div
          className="h-32 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(167,139,250,0.1))' }}
        >
          {family.coverImageBlob ? (
            <img src={family.coverImageBlob} alt={family.familyName} className="w-full h-full object-cover" />
          ) : (
            <div className="text-indigo-400/30 group-hover:text-indigo-400/50 transition-colors">
              <Users2 size={48} />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <PrivacyBadge mode={family.privacyMode} />
          </div>
        </div>

        {/* Info */}
        <div>
          <h3 className="font-bold text-white text-lg mb-1 group-hover:text-indigo-400 transition-colors">
            {family.familyName}
          </h3>

          {family.description && (
            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{family.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {memberCount} thành viên
            </span>
            <span className="flex items-center gap-1">
              <Image size={12} />
              {memoryCount} ký ức
            </span>
            <span className="ml-auto">{formatDate(family.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
