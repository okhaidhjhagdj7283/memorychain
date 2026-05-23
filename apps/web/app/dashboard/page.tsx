'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Plus, Image, Users, HardDrive, Star, Upload, Compass, ArrowRight } from 'lucide-react'
import { useFamilies } from '@/hooks/useFamilies'
import { useAuth } from '@/hooks/useAuth'
import { FamilyCard } from '@/components/family/FamilyCard'
import { FamilyCardSkeleton } from '@/components/ui/Skeleton'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { truncateAddress } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const { account, connected } = useWallet()
  const { isAuthenticated } = useAuth()
  const { data: families, isLoading } = useFamilies()

  useEffect(() => {
    if (!connected) router.push('/login')
  }, [connected, router])

  const totalMemories = families?.reduce((sum, f) => sum + (f._count?.memories || 0), 0) || 0
  const totalMembers  = families?.reduce((sum, f) => sum + (f._count?.members  || 0), 0) || 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="fixed inset-0 pointer-events-none bg-grid opacity-35" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 pt-20 sm:pt-22">

        {/* ── Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
          <div className="flex items-center gap-3 animate-slide-up">
            <Avatar address={account?.address?.toString()} size="lg" />
            <div>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-3)' }}>Chào mừng trở lại 👋</p>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>
                {account?.address ? truncateAddress(account.address.toString(), 8) : 'Vault của bạn'}
              </h1>
            </div>
          </div>
          <Link href="/family/create" className="no-underline animate-fade-in">
            <Button icon={<Plus size={14} />}>Tạo vault mới</Button>
          </Link>
        </div>

        {/* ── Stats ────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7 stagger">
          {[
            { label: 'Vault gia đình',  value: families?.length || 0, icon: Star,      color: 'var(--indigo-light)' },
            { label: 'Ký ức đã lưu',   value: totalMemories,          icon: Image,     color: 'var(--amber)' },
            { label: 'Thành viên',      value: totalMembers,           icon: Users,     color: 'var(--green)' },
            { label: 'Dung lượng dùng', value: '~0 MB',               icon: HardDrive, color: 'var(--blue)' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card">
              <Icon size={16} className="mb-2.5" style={{ color }} />
              <div className="text-xl sm:text-2xl font-bold mb-0.5" style={{ color: 'var(--text-1)' }}>{value}</div>
              <div className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Families ─────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-1)' }}>
              Vault gia đình của bạn
            </h2>
            <Link
              href="/explore"
              className="flex items-center gap-1 text-xs no-underline transition-colors"
              style={{ color: 'var(--indigo-light)' }}
            >
              Khám phá <ArrowRight size={12} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <FamilyCardSkeleton key={i} />)}
            </div>
          ) : families && families.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
              {families.map(family => <FamilyCard key={family.id} family={family} />)}

              {/* Create new card */}
              <Link href="/family/create" className="no-underline">
                <div
                  className="card flex flex-col items-center justify-center min-h-44 cursor-pointer transition-all duration-200 group hover:-translate-y-1"
                  style={{ borderStyle: 'dashed' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'
                    e.currentTarget.style.background   = 'rgba(99,102,241,0.04)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.background   = 'var(--bg-surface)'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-2.5"
                    style={{ background: 'var(--indigo-dim)' }}
                  >
                    <Plus size={20} style={{ color: 'var(--indigo-light)' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Tạo vault mới</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Bắt đầu lưu trữ ký ức</p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="card p-10 sm:p-14 text-center animate-scale-in">
              <div className="text-4xl mb-4">🏡</div>
              <h3 className="font-semibold mb-1.5" style={{ color: 'var(--text-1)' }}>Chưa có vault gia đình</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>
                Tạo vault đầu tiên để bắt đầu lưu trữ ký ức gia đình bạn
              </p>
              <Link href="/family/create" className="no-underline">
                <Button icon={<Plus size={14} />}>Tạo vault đầu tiên</Button>
              </Link>
            </div>
          )}
        </div>

        {/* ── Quick Actions ─────────────────────────────── */}
        {families && families.length > 0 && (
          <div className="card p-4 sm:p-5">
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--text-3)' }}
            >
              Hành động nhanh
            </p>
            <div className="flex flex-wrap gap-2">
              {families.slice(0, 2).map(family => (
                <Link key={family.id} href={`/family/${family.id}/upload`} className="no-underline">
                  <QuickActionChip color="var(--indigo-light)">
                    <Upload size={11} style={{ color: 'var(--indigo-light)' }} />
                    Upload → {family.familyName}
                  </QuickActionChip>
                </Link>
              ))}
              <Link href="/explore" className="no-underline">
                <QuickActionChip color="var(--green)">
                  <Compass size={11} style={{ color: 'var(--green)' }} />
                  Khám phá
                </QuickActionChip>
              </Link>
              <Link href="/family/create" className="no-underline">
                <QuickActionChip color="var(--amber)">
                  <Plus size={11} style={{ color: 'var(--amber)' }} />
                  Vault mới
                </QuickActionChip>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function QuickActionChip({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all duration-150"
      style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-hover)'
        e.currentTarget.style.color = 'var(--text-1)'
        e.currentTarget.style.background = 'var(--bg-hover)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.color = 'var(--text-2)'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </div>
  )
}
