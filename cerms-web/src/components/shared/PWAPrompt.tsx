import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function PWAPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // eslint-disable-next-line no-console
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      // eslint-disable-next-line no-console
      console.log('SW registration error', error)
    },
  })

  const [installPrompt, setInstallPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
    }
  }

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {(offlineReady || needRefresh) && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2">
            <span className="text-sm font-medium">
              {offlineReady ? 'App ready to work offline' : 'New content available, click on reload button to update.'}
            </span>
          </div>
          <div className="flex gap-2">
            {needRefresh && (
              <button
                className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                onClick={() => updateServiceWorker(true)}
              >
                Reload
              </button>
            )}
            <button
              className="rounded border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              onClick={close}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {installPrompt && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <span className="font-bold">C</span>
            </div>
            <div>
              <p className="text-sm font-semibold">Install CERMS</p>
              <p className="text-xs text-slate-500">Install our app for a better experience</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              className="flex-1 rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              onClick={handleInstall}
            >
              Install App
            </button>
            <button
              className="rounded border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              onClick={() => setInstallPrompt(null)}
            >
              Later
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
