'use client'

import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { FamilySidebar } from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
  familyId: string
  familyName?: string
}

export function AppLayout({ children, familyId, familyName }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change via resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <FamilySidebar
        familyId={familyId}
        familyName={familyName}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="main-with-sidebar">
        {/* Mobile top bar */}
        <div
          className="flex md:hidden items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <button
            className="btn-icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Mở menu"
          >
            <Menu size={16} />
          </button>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
            {familyName || 'Vault'}
          </span>
        </div>

        {children}
      </main>
    </div>
  )
}
