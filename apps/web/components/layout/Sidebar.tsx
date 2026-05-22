'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Upload, Users, GitBranch,
  Shield, ArrowLeft, Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  familyId: string
  familyName?: string
}

export function FamilySidebar({ familyId, familyName }: SidebarProps) {
  const pathname = usePathname()

  const links = [
    { href: `/family/${familyId}`, label: 'Vault', icon: ImageIcon },
    { href: `/family/${familyId}/upload`, label: 'Upload ký ức', icon: Upload },
    { href: `/family/${familyId}/members`, label: 'Thành viên', icon: Users },
    { href: `/family/${familyId}/tree`, label: 'Cây gia phả', icon: GitBranch },
    { href: `/family/${familyId}/inheritance`, label: 'Kế thừa', icon: Shield },
  ]

  return (
    <aside className="sidebar">
      {/* Back */}
      <Link href="/dashboard" className="sidebar-item mb-4">
        <ArrowLeft size={16} />
        <span>Dashboard</span>
      </Link>

      <div className="divider" />

      {/* Family name */}
      <div className="px-3 py-2 mb-2">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Vault gia đình</p>
        <p className="text-sm font-semibold text-white truncate">{familyName || 'Đang tải...'}</p>
      </div>

      {/* Nav links */}
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn('sidebar-item', pathname === href && 'active')}
        >
          <Icon size={16} />
          <span>{label}</span>
        </Link>
      ))}
    </aside>
  )
}
