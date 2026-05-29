import { useEffect, useState } from 'react'
import { offlineQueue } from '@/api/offlineQueue'
import { toast } from 'sonner'

export function OfflineSyncManager() {
  const [pendingCount, setPendingCount] = useState(0)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const checkQueue = async () => {
    const billingQueue = await offlineQueue.getQueue()
    const assignmentQueue = await offlineQueue.getAssignmentQueue()
    
    const unsyncedBilling = billingQueue.filter(i => !i.synced).length
    const unsyncedAssignments = assignmentQueue.filter(i => !i.synced).length
    const totalUnsynced = unsyncedBilling + unsyncedAssignments
    
    setPendingCount(totalUnsynced)
    
    if (totalUnsynced > 0 && navigator.onLine) {
      toast.info(`Syncing ${totalUnsynced} pending actions...`)
      await offlineQueue.syncQueue()
      
      const updatedBilling = await offlineQueue.getQueue()
      const updatedAssignment = await offlineQueue.getAssignmentQueue()
      const newTotalUnsynced = updatedBilling.filter(i => !i.synced).length + updatedAssignment.filter(i => !i.synced).length
      
      setPendingCount(newTotalUnsynced)
    }
  }

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      checkQueue()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for Service Worker background sync success
    const channel = new BroadcastChannel('billing-sync-status')
    channel.onmessage = (event) => {
      if (event.data.type === 'SYNC_SUCCESS') {
        toast.success('Bill synced successfully')
        checkQueue()
      }
    }

    // Initial check
    checkQueue()

    // Periodically check queue in case sync failed previously
    const interval = setInterval(checkQueue, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  if (!isOnline) {
    return (
      <div className="fixed bottom-20 right-4 z-40 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg animate-pulse">
        Offline Mode
      </div>
    )
  }

  if (pendingCount > 0) {
    return (
      <div className="fixed bottom-20 right-4 z-40 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-lg flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
        {pendingCount} Pending Sync
      </div>
    )
  }

  return null
}
