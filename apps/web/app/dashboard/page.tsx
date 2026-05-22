'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Plus, Image, Users, HardDrive, TrendingUp, Clock, Star } from 'lucide-react'
import { useFamilies } from '@/hooks/useFamilies'
import { useAuth } from '@/hooks/useAuth'
import { FamilyCard } from '@/components/family/FamilyCard'
import { FamilyCardSkeleton } from '@/components/ui/Skeleton'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { truncateAddress, formatDateRelative } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const { account, connected } = useWallet()
  const { isAuthenticated } = useAuth()
  const { data: families, isLoading } = useFamilies()

  useEffect(() => {
    if (!connected) router.push('/login')
  }, [connected, router])

  const totalMemories = families?.reduce((sum, f) => sum + (f._count?.memories || 0), 0) || 0
  const totalMembers = families?.reduce((sum, f) => sum + (f._count?.members || 0), 0) || 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb orb-indigo w-96 h-96 top-0 right-0" style={{ animationDelay: '1s' }} />
        <div className="bg-grid absolute inset-0" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <Avatar address={account?.address?.toString()} size="lg" />
            <div>
              <p className="text-slate-400 text-sm">Chào mừng trở lại 👋</p>
              <h1 className="text-2xl font-bold text-white">
                {account?.address ? truncateAddress(account.address.toString(), 8) : 'Vault của bạn'}
              </h1>
            </div>
          </div>
          <Link href="/family/create">
            <Button icon={<Plus size={16} />}>Tạo vault mới</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: 'Vault gia đình',
              value: families?.length || 0,
              icon: <Star size={20} className="text-indigo-400" />,
              color: 'rgba(99,102,241,0.1)',
            },
            {
              label: 'Ký ức đã lưu',
              value: totalMemories,
              icon: <Image size={20} className="text-amber-400" />,
              color: 'rgba(245,158,11,0.1)',
            },
            {
              label: 'Thành viên gia đình',
              value: totalMembers,
              icon: <Users size={20} className="text-emerald-400" />,
              color: 'rgba(16,185,129,0.1)',
            },
            {
              label: 'Dung lượng dùng',
              value: '~0 MB',
              icon: <HardDrive size={20} className="text-blue-400" />,
              color: 'rgba(96,165,250,0.1)',
            },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.color }}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Families grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Vault gia đình của bạn</h2>
            <Link href="/explore" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors no-underline flex items-center gap-1">
              Khám phá cộng đồng →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <FamilyCardSkeleton key={i} />)}
            </div>
          ) : families && families.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {families.map(family => (
                <FamilyCard key={family.id} family={family} />
              ))}
              {/* Create new card */}
              <Link href="/family/create" className="no-underline">
                <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center min-h-48 border-dashed hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:bg-indigo-500/20 transition-colors">
                    <Plus size={24} className="text-indigo-400" />
                  </div>
                  <p className="text-white font-semibold text-sm">Tạo vault mới</p>
                  <p className="text-slate-500 text-xs mt-1">Bắt đầu lưu trữ ký ức gia đình</p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="empty-state glass rounded-2xl">
              <div className="text-6xl mb-4">🏡</div>
              <h3 className="text-xl font-bold text-white mb-2">Chưa có vault gia đình</h3>
              <p className="text-slate-400 mb-6">Tạo vault đầu tiên để bắt đầu lưu trữ ký ức gia đình bạn</p>
              <Link href="/family/create">
                <Button icon={<Plus size={16} />}>Tạo vault đầu tiên</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" />
            Hành động nhanh
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {families?.slice(0, 2).map(family => (
              <Link key={family.id} href={`/family/${family.id}/upload`} className="no-underline">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all border border-white/5 hover:border-white/10">
                  <Image size={14} className="text-indigo-400" />
                  Upload vào {family.familyName}
                </div>
              </Link>
            ))}
            <Link href="/explore" className="no-underline">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all border border-white/5 hover:border-white/10">
                <Users size={14} className="text-emerald-400" />
                Khám phá ký ức
              </div>
            </Link>
            <Link href="/family/create" className="no-underline">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all border border-white/5 hover:border-white/10">
                <Plus size={14} className="text-amber-400" />
                Vault mới
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
