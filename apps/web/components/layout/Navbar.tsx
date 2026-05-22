'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Home, Compass, LogOut, User } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { truncateAddress } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export function Navbar() {
  const pathname = usePathname()
  const { connected, account, disconnect } = useWallet()
  const { isAuthenticated, logout } = useAuth()

  const isLanding = pathname === '/'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" style={{ background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
            M
          </div>
          <span className="font-bold text-white text-lg font-display">MemoryChain</span>
        </Link>

        {/* Nav links */}
        {!isLanding && (
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/dashboard" icon={<Home size={15} />} active={pathname === '/dashboard'}>Dashboard</NavLink>
            <NavLink href="/explore" icon={<Compass size={15} />} active={pathname === '/explore'}>Khám phá</NavLink>
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {connected && account ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-sm text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {truncateAddress(account.address.toString())}
              </div>
              {isAuthenticated && (
                <Link href="/dashboard">
                  <Avatar address={account.address.toString()} size="sm" />
                </Link>
              )}
              <button
                onClick={() => { logout(); disconnect() }}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Kết nối ví</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, children, icon, active }: { href: string; children: React.ReactNode; icon?: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
        active ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {children}
    </Link>
  )
}
