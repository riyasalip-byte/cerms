import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkOnly } from 'workbox-strategies'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

declare const self: any

// The string 'self.__WB_MANIFEST' must be literal for workbox-build to find it
precacheAndRoute(self.__WB_MANIFEST)

const bgSyncPlugin = new BackgroundSyncPlugin('billing-sync-queue', {
  maxRetentionTime: 24 * 60,
  onSync: async ({ queue }) => {
    let entry
    while ((entry = await queue.shiftRequest())) {
      try {
        const response = await fetch(entry.request.clone())
        if (response.ok) {
          const channel = new BroadcastChannel('billing-sync-status')
          channel.postMessage({ type: 'SYNC_SUCCESS', url: entry.request.url })
        } else {
          await queue.unshiftRequest(entry)
          return
        }
      } catch (error) {
        await queue.unshiftRequest(entry)
        return
      }
    }
  }
})

registerRoute(
  /\/api\/v1\/rentals\/.*\/close/i,
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST'
)

self.addEventListener('message', (event: any) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
