'use client'

import Link from 'next/link'
import { Users2, Users, Image, ArrowRight } from 'lucide-react'
import { Family } from '@/types'
import { formatDate } from '@/lib/utils'
import { PrivacyBadge } from '@/components/ui/Badge'

export function FamilyCard({ family }: { family: Family }) {
  const memberCount = family._count?.members  || 0
  const memoryCount = family._count?.memories || 0

  return (
    <Link href={`/family/${family.id}`} className="block no-underline group">
      <div className="card p-4 sm:p-5 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg h-full">
        {/* Cover */}
        <div
          className="h-28 rounded-lg mb-3.5 flex items-center justify-center relative overflow-hidden"
          style={{ background: 'var(--bg-elevated)' }}
        >
          {family.coverImageBlob ? (
            <img
              src={family.coverImageBlob}
              alt={family.familyName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Users2
              size={34}
              style={{ color: 'var(--text-4)' }}
            />
          )}
          <div className="absolute top-2 right-2">
            <PrivacyBadge mode={family.privacyMode} />
          </div>
        </div>

        {/* Info */}
        <h3
          className="font-semibold text-sm mb-1 truncate transition-colors group-hover:text-[color:var(--indigo-light)]"
          style={{ color: 'var(--text-1)' }}
        >
          {family.familyName}
        </h3>

        {family.description && (
          <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-2)' }}>
            {family.description}
          </p>
        )}

        <div
          className="flex items-center justify-between text-xs pt-2.5 mt-auto"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--text-3)' }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users size={10} /> {memberCount}
            </span>
            <span className="flex items-center gap-1">
              <Image size={10} /> {memoryCount}
            </span>
          </div>
          <span>{formatDate(family.createdAt)}</span>
        </div>
      </div>
    </Link>
  )
}
