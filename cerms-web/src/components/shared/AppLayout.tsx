import { useCallback, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { PWAPrompt } from './PWAPrompt'
import { OfflineSyncManager } from './OfflineSyncManager'

export type AppLayoutProps = {
  defaultCollapsed?: boolean
}

export function AppLayout({ defaultCollapsed }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(Boolean(defaultCollapsed))
  const [mobileOpen, setMobileOpen] = useState(false)

  const onToggleCollapsed = useCallback(() => {
    setCollapsed((v) => !v)
  }, [])

  const onOpenMobileSidebar = useCallback(() => {
    setMobileOpen(true)
  }, [])

  const onCloseMobile = useCallback(() => {
    setMobileOpen(false)
  }, [])

  const mainPadding = useMemo(() => {
    return collapsed ? 'md:pl-16' : 'md:pl-64'
  }, [collapsed])

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="md:fixed md:inset-y-0 md:left-0">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggleCollapsed={onToggleCollapsed}
          onCloseMobile={onCloseMobile}
        />
      </div>

      <div className={mainPadding}>
        <Topbar onOpenMobileSidebar={onOpenMobileSidebar} />
        <main className="px-4 py-6">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
      <PWAPrompt />
      <OfflineSyncManager />
    </div>
  )
}

