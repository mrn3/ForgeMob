import { useEffect, useRef, useSyncExternalStore } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const WS_URL = typeof window !== 'undefined'
  ? (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.hostname + ':1234'
  : 'ws://localhost:1234'

const docCache = new Map<string, Y.Doc>()
const providerCache = new Map<string, WebsocketProvider>()

export function getRoom(docId: string, appType: string): string {
  return `${appType}-${docId}`
}

export function useYDoc(docId: string, appType: string): Y.Doc {
  const room = getRoom(docId, appType)
  const docRef = useRef<Y.Doc | null>(null)
  if (!docRef.current) {
    if (!docCache.has(room)) {
      docCache.set(room, new Y.Doc())
    }
    docRef.current = docCache.get(room)!
  }
  const doc = docRef.current

  useEffect(() => {
    if (!providerCache.has(room)) {
      providerCache.set(room, new WebsocketProvider(WS_URL, room, doc))
    }
    return () => {
      const prov = providerCache.get(room)
      if (prov) {
        prov.destroy()
        providerCache.delete(room)
        docCache.delete(room)
      }
    }
  }, [room, doc])

  return doc
}

export function useYMap<T extends Record<string, unknown>>(doc: Y.Doc, key: string): T {
  const root = doc.getMap(key)
  const snapshotRef = useRef<T>(root.toJSON() as T)
  return useSyncExternalStore(
    (onChange) => {
      const handler = () => {
        snapshotRef.current = root.toJSON() as T
        onChange()
      }
      root.observe(handler)
      return () => root.unobserve(handler)
    },
    () => snapshotRef.current,
    () => snapshotRef.current
  )
}

export function useYArray<T>(doc: Y.Doc, key: string): T[] {
  const root = doc.getArray(key)
  const snapshotRef = useRef<T[]>(root.toArray() as T[])
  return useSyncExternalStore(
    (onChange) => {
      const handler = () => {
        snapshotRef.current = root.toArray() as T[]
        onChange()
      }
      root.observe(handler)
      return () => root.unobserve(handler)
    },
    () => snapshotRef.current,
    () => snapshotRef.current
  )
}

export function useYText(doc: Y.Doc, key: string): string {
  const root = doc.getText(key)
  return useSyncExternalStore(
    (onChange) => {
      const handler = () => onChange()
      root.observe(handler)
      return () => root.unobserve(handler)
    },
    () => root.toString(),
    () => root.toString()
  )
}
