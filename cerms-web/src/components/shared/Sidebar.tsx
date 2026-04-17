import { Link, useLocation } from 'react-router-dom'

type MenuItem = {
  label: string
  to: string
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Assets', to: '/assets' },
  { label: 'Customers', to: '/customers' },
  { label: 'Rentals', to: '/rentals' },
  { label: 'Invoices', to: '/invoices' },
  { label: 'Staff', to: '/staff' },
  { label: 'Reports', to: '/reports' },
  { label: 'Settings', to: '/settings' },
]

export type SidebarProps = {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapsed: () => void
  onCloseMobile: () => void
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapsed,
  onCloseMobile,
}: SidebarProps) {
  const location = useLocation()

  const nav = (
    <aside
      className={[
        'flex h-full flex-col border-r border-slate-200 bg-white text-slate-900',
        'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50',
        collapsed ? 'w-16' : 'w-64',
      ].join(' ')}
      aria-label="Sidebar"
    >
      <div className="flex h-14 items-center justify-between gap-2 px-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid size-9 place-items-center rounded-md bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900">
            <span className="text-sm font-semibold">C</span>
          </div>
          {!collapsed && (
            <span className="truncate text-sm font-semibold tracking-tight">
              CERMS
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="hidden rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50 md:inline-flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path
              fill="currentColor"
              d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z"
            />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <ul className="space-y-1">
          {MENU_ITEMS.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onCloseMobile}
                  className={[
                    'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                    active
                      ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-900/60 dark:hover:text-slate-50',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'grid size-8 place-items-center rounded-md',
                      active
                        ? 'bg-white/10 dark:bg-slate-900/10'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    <span className="text-xs font-semibold">
                      {item.label.slice(0, 1)}
                    </span>
                  </span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          onClick={onToggleCollapsed}
        >
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>
    </aside>
  )

  return (
    <>
      <div
        className={[
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity md:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        aria-hidden="true"
        onClick={onCloseMobile}
      />

      <div
        className={[
          'fixed left-0 top-0 z-50 h-dvh transition-transform md:static md:z-auto md:h-auto md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {nav}
      </div>
    </>
  )
}

