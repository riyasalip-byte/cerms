export type TopbarProps = {
  onOpenMobileSidebar: () => void
}

export function Topbar({ onOpenMobileSidebar }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="inline-flex rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-slate-50 md:hidden"
            aria-label="Open sidebar"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              <path
                fill="currentColor"
                d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z"
              />
            </svg>
          </button>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
              Dashboard
            </div>
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">
              Placeholder subtitle
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-slate-50 sm:inline-flex"
          >
            Notifications
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                Jane Doe
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Admin
              </div>
            </div>
            <div className="grid size-9 place-items-center rounded-full bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900">
              <span className="text-sm font-semibold">JD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

