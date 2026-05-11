'use client'

// IndexedDB queue for offline write replay via idb library
import { openDB, type IDBPDatabase } from 'idb'

export interface QueuedAction {
  id?: number
  action: string   // server action name
  payload: unknown
  queued_at: number
}

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB('caixinha-offline', 1, {
      upgrade(db) {
        db.createObjectStore('action_queue', { keyPath: 'id', autoIncrement: true })
      },
    })
  }
  return dbPromise
}

export async function enqueueAction(action: string, payload: unknown) {
  const db = await getDb()
  await db.add('action_queue', { action, payload, queued_at: Date.now() })
}

export async function getAllQueued(): Promise<QueuedAction[]> {
  const db = await getDb()
  return db.getAll('action_queue')
}

export async function deleteQueued(id: number) {
  const db = await getDb()
  await db.delete('action_queue', id)
}
