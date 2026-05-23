'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { LayoutDashboard, Compass, LogOut, Menu, X, ChevronDown } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { truncateAddress } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export function Navbar() {
  const pathname = usePathname()
  const { connected, account, disconnect } = useWallet()
  const { isAuthenticated, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isLanding = pathname === '/'

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/explore',   label: 'Khám phá',   icon: Compass },
  ]

  return (
    <>
      <nav className="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline flex-shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
              style={{ background: 'linear-gradient(135deg, var(--indigo), #7c3aed)' }}
            >
              M
            </div>
            <span className="font-bold text-white text-[14px] tracking-tight">MemoryChain</span>
          </Link>

          {/* Nav links — desktop, not on landing */}
          {!isLanding && (
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <NavLink key={href} href={href} active={pathname === href}>
                  <Icon size={13} />
                  {label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {connected && account ? (
              <div className="flex items-center gap-1.5">
                {/* Address chip — desktop only */}
                <div
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-2)',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse-soft"
                    style={{ background: 'var(--green)', display: 'inline-block' }}
                  />
                  {truncateAddress(account.address.toString())}
                </div>

                {isAuthenticated && (
                  <Link href="/dashboard" className="no-underline">
                    <Avatar address={account.address.toString()} size="sm" />
                  </Link>
                )}

                <button
                  onClick={() => { logout(); disconnect() }}
                  className="btn-icon"
                  title="Đăng xuất"
                  aria-label="Đăng xuất"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="btn-primary text-xs px-3.5 py-1.75">Kết nối ví</button>
              </Link>
            )}

            {/* Mobile menu button — not on landing */}
            {!isLanding && (
              <button
                className="btn-icon md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Mở menu"
              >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && !isLanding && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="fixed top-14 left-0 right-0 z-40 md:hidden border-b animate-slide-down"
            style={{
              background: 'rgba(8,8,16,0.96)',
              backdropFilter: 'blur(20px)',
              borderColor: 'var(--border)',
              padding: '0.75rem 1rem',
            }}
          >
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors mb-1"
                style={{
                  color: pathname === href ? 'var(--indigo-light)' : 'var(--text-2)',
                  background: pathname === href ? 'var(--indigo-dim)' : 'transparent',
                }}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  )
}

function NavLink({
  href,
  children,
  active,
}: {
  href: string
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors no-underline ${
        active
          ? 'text-white'
          : 'hover:text-[color:var(--text-1)]'
      }`}
      style={{
        color: active ? 'var(--text-1)' : 'var(--text-2)',
        background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
      }}
    >
      {children}
    </Link>
  )
}
