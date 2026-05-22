import { cn } from '@/lib/utils'

type BadgeVariant = 'indigo' | 'amber' | 'emerald' | 'red' | 'slate'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'indigo', children, className }: BadgeProps) {
  return (
    <span className={cn('badge', `badge-${variant}`, className)}>
      {children}
    </span>
  )
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    OWNER: { label: 'Chủ sở hữu', variant: 'indigo' },
    EDITOR: { label: 'Biên tập', variant: 'amber' },
    VIEWER: { label: 'Người xem', variant: 'slate' },
    HEIR: { label: 'Kế thừa', variant: 'emerald' },
  }
  const config = map[role] || { label: role, variant: 'slate' as BadgeVariant }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function PrivacyBadge({ mode }: { mode: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    PRIVATE: { label: '🔒 Riêng tư', variant: 'slate' },
    FAMILY_ONLY: { label: '👨👩👧 Gia đình', variant: 'indigo' },
    PUBLIC: { label: '🌐 Công khai', variant: 'emerald' },
  }
  const config = map[mode] || { label: mode, variant: 'slate' as BadgeVariant }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function MemoryTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    PHOTO: { label: '📷 Ảnh', variant: 'indigo' },
    VIDEO: { label: '🎬 Video', variant: 'amber' },
    AUDIO: { label: '🎵 Âm thanh', variant: 'emerald' },
    DOCUMENT: { label: '📄 Tài liệu', variant: 'slate' },
    LETTER: { label: '✉️ Thư tay', variant: 'amber' },
    STORY: { label: '📖 Câu chuyện', variant: 'indigo' },
  }
  const config = map[type] || { label: type, variant: 'slate' as BadgeVariant }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
