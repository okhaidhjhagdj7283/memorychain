'use client'

import { FamilySidebar } from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
  familyId?: string
  familyName?: string
  withSidebar?: boolean
}

export function AppLayout({ children, familyId, familyName, withSidebar }: AppLayoutProps) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {withSidebar && familyId && (
        <FamilySidebar familyId={familyId} familyName={familyName} />
      )}
      <main className={withSidebar ? 'ml-60 pt-16' : 'pt-16'}>
        {children}
      </main>
    </div>
  )
}
