import { useState, useEffect } from 'react'

interface ToastItem {
  id: number
  message: string
  type: 'error' | 'success'
}

type Listener = (items: ToastItem[]) => void

let _items: ToastItem[] = []
let _listeners: Listener[] = []
let _nextId = 0

function _notify() {
  _listeners.forEach(l => l([..._items]))
}

function _add(message: string, type: ToastItem['type'], duration = 4000) {
  const id = _nextId++
  _items = [..._items, { id, message, type }]
  _notify()
  setTimeout(() => {
    _items = _items.filter(t => t.id !== id)
    _notify()
  }, duration)
}

export const toast = {
  error: (message: string) => _add(message, 'error'),
  success: (message: string) => _add(message, 'success'),
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    _listeners.push(setItems)
    return () => {
      _listeners = _listeners.filter(l => l !== setItems)
    }
  }, [])

  if (!items.length) return null

  return (
    <div className="fixed bottom-6 left-0 right-0 flex flex-col items-center gap-2 z-[9999] pointer-events-none px-4">
      {items.map(t => (
        <div
          key={t.id}
          role="alert"
          className={`px-4 py-2.5 rounded-xl text-[0.85rem] font-medium shadow-lg backdrop-blur-sm animate-fade-in ${
            t.type === 'error'
              ? 'bg-red-950/95 text-red-200 border border-red-800/60'
              : 'bg-green-950/95 text-green-200 border border-green-800/60'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
