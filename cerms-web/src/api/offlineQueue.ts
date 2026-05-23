import { openDB, type IDBPDatabase } from 'idb'
import { rentalService } from './services'

const DB_NAME = 'cerms_offline_db'
const STORE_NAME = 'billing_queue'

export interface BillingRequest {
  id?: number
  rentalId: string
  actualEndDate: string
  currentOdometer: number
  timestamp: number
  synced: boolean
}

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        }
      },
    })
  }
  return dbPromise
}

export const offlineQueue = {
  async addBillingRequest(request: Omit<BillingRequest, 'id' | 'synced'>) {
    const db = await getDB()
    await db.add(STORE_NAME, { ...request, synced: false })
    
    // Attempt sync immediately if online
    if (navigator.onLine) {
      await this.syncQueue()
    }
  },

  async getQueue(): Promise<BillingRequest[]> {
    const db = await getDB()
    return db.getAll(STORE_NAME)
  },

  async clearSynced() {
    const db = await getDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const items = await store.getAll()
    
    for (const item of items) {
      if (item.synced) {
        await store.delete(item.id)
      }
    }
    await tx.done
  },

  async syncQueue() {
    if (!navigator.onLine) return

    const db = await getDB()
    const items: BillingRequest[] = await db.getAll(STORE_NAME)
    const unsynced = items.filter(i => !i.synced)

    for (const item of unsynced) {
      try {
        await rentalService.completeRental(item.rentalId, {
          actualEndDateTime: new Date(item.actualEndDate).toISOString(),
          endOdometer: item.currentOdometer
        })
        
        // Mark as synced
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        await store.put({ ...item, synced: true })
        await tx.done
      } catch (error) {
        console.error(`Failed to sync billing request for rental ${item.rentalId}:`, error)
        // Leave it unsynced for next retry
      }
    }

    await this.clearSynced()
  }
}
