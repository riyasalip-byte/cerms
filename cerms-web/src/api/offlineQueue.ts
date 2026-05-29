import { openDB, type IDBPDatabase } from 'idb'
import { rentalService } from './services'
import * as operatorsApi from './operators'

const DB_NAME = 'cerms_offline_db'
const STORE_NAME = 'billing_queue'
const ASSIGNMENTS_STORE = 'assignments_queue'

export interface BillingRequest {
  id?: number
  rentalId: string
  actualEndDate: string
  currentOdometer: number
  timestamp: number
  synced: boolean
}

export interface OfflineAssignmentAction {
  id?: number
  assignmentId: string
  actionType: 'accept' | 'start' | 'complete' | 'generate-invoice'
  data?: any
  timestamp: number
  synced: boolean
}

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 2, {
      upgrade(db, oldVersion, newVersion) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        }
        if (!db.objectStoreNames.contains(ASSIGNMENTS_STORE)) {
          db.createObjectStore(ASSIGNMENTS_STORE, { keyPath: 'id', autoIncrement: true })
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

  async addAssignmentAction(action: Omit<OfflineAssignmentAction, 'id' | 'synced'>) {
    const db = await getDB()
    await db.add(ASSIGNMENTS_STORE, { ...action, synced: false })
    
    // Attempt sync immediately if online
    if (navigator.onLine) {
      await this.syncQueue()
    }
  },

  async getQueue(): Promise<BillingRequest[]> {
    const db = await getDB()
    return db.getAll(STORE_NAME)
  },

  async getAssignmentQueue(): Promise<OfflineAssignmentAction[]> {
    const db = await getDB()
    return db.getAll(ASSIGNMENTS_STORE)
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

  async clearSyncedAssignments() {
    const db = await getDB()
    const tx = db.transaction(ASSIGNMENTS_STORE, 'readwrite')
    const store = tx.objectStore(ASSIGNMENTS_STORE)
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

    // 1. Sync billing queue
    const billingItems: BillingRequest[] = await db.getAll(STORE_NAME)
    const unsyncedBilling = billingItems.filter(i => !i.synced)

    for (const item of unsyncedBilling) {
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
      }
    }

    // 2. Sync assignments queue
    const assignmentItems: OfflineAssignmentAction[] = await db.getAll(ASSIGNMENTS_STORE)
    const unsyncedAssignments = assignmentItems.filter(i => !i.synced)

    for (const item of unsyncedAssignments) {
      try {
        if (item.actionType === 'accept') {
          await operatorsApi.acceptAssignment(item.assignmentId)
        } else if (item.actionType === 'start') {
          await operatorsApi.startAssignment(item.assignmentId, item.data)
        } else if (item.actionType === 'complete') {
          await operatorsApi.completeAssignment(item.assignmentId, item.data)
        } else if (item.actionType === 'generate-invoice') {
          await operatorsApi.generateAssignmentInvoice(item.assignmentId)
        }

        // Mark as synced
        const tx = db.transaction(ASSIGNMENTS_STORE, 'readwrite')
        const store = tx.objectStore(ASSIGNMENTS_STORE)
        await store.put({ ...item, synced: true })
        await tx.done
      } catch (error: any) {
        console.error(`Failed to sync assignment action ${item.actionType} for assignment ${item.assignmentId}:`, error)
        
        // Conflict handling: if assignment is already completed/closed or transitions are invalid (e.g. status code conflicts),
        // we log conflicts and let server state win by marking as synced.
        const errMessage = error?.response?.data?.error || error?.message || ''
        if (
          errMessage.includes('already') || 
          errMessage.includes('status') || 
          errMessage.includes('completed') || 
          errMessage.includes('closed') ||
          errMessage.includes('invalid')
        ) {
          console.warn(`Sync Conflict resolved (Server Wins) for assignment ${item.assignmentId}:`, errMessage)
          const tx = db.transaction(ASSIGNMENTS_STORE, 'readwrite')
          const store = tx.objectStore(ASSIGNMENTS_STORE)
          await store.put({ ...item, synced: true })
          await tx.done
        }
      }
    }

    await this.clearSynced()
    await this.clearSyncedAssignments()
  }
}

