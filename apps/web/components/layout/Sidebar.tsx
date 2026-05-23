'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Upload, Users, GitBranch,
  Shield, ChevronLeft, Image as ImageIcon, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  familyId: string
  familyName?: string
  onClose?: () => void
}

export function FamilySidebar({ familyId, familyName, onClose }: SidebarProps) {
  const pathname = usePathname()

  const links = [
    { href: `/family/${familyId}`,             label: 'Vault',       icon: ImageIcon },
    { href: `/family/${familyId}/upload`,      label: 'Upload',      icon: Upload },
    { href: `/family/${familyId}/members`,     label: 'Thành viên',  icon: Users },
    { href: `/family/${familyId}/tree`,        label: 'Gia phả',     icon: GitBranch },
    { href: `/family/${familyId}/inheritance`, label: 'Kế thừa',     icon: Shield },
  ]

  return (
    <aside className="sidebar" id="family-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between px-2 mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--indigo), #7c3aed)' }}
          >
            M
          </div>
          <span className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>MemoryChain</span>
        </div>
        {onClose && (
          <button className="btn-icon" onClick={onClose} aria-label="Đóng sidebar">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="divider-sm" />

      {/* Back to dashboard */}
      <Link href="/dashboard" className="sidebar-item mb-1">
        <ChevronLeft size={13} style={{ color: 'var(--text-3)' }} />
        <span>Dashboard</span>
      </Link>

      <div className="divider-sm" />

      {/* Family name */}
      <div className="px-3 py-2 mb-0.5">
        <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-3)' }}>
          Vault gia đình
        </p>
        <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-1)' }}>
          {familyName || '…'}
        </p>
      </div>

      {/* Nav */}
      <div className="flex flex-col gap-0.5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn('sidebar-item', pathname === href && 'active')}
            onClick={onClose}
          >
            <Icon size={14} className="sidebar-icon flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </aside>
  )
}
