import { useState, useEffect, useCallback } from 'react'
import styles from './Toast.module.css'

interface ToastItem {
  id: number
  message: string
  type: 'error' | 'success'
  duration: number
}

type Listener = (items: ToastItem[]) => void

let _items: ToastItem[] = []
let _listeners: Listener[] = []
let _nextId = 0
const _timers = new Map<number, ReturnType<typeof setTimeout>>()

function _notify() {
  _listeners.forEach(l => l([..._items]))
}

function _remove(id: number) {
  clearTimeout(_timers.get(id))
  _timers.delete(id)
  _items = _items.filter(t => t.id !== id)
  _notify()
}

function _add(message: string, type: ToastItem['type'], duration = 4000) {
  const id = _nextId++
  _items = [..._items, { id, message, type, duration }]
  _notify()
  _timers.set(id, setTimeout(() => _remove(id), duration))
}

export const toast = {
  error: (message: string) => _add(message, 'error'),
  success: (message: string) => _add(message, 'success'),
}

function ErrorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.5 1.5L13.5 12.5H1.5L7.5 1.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <line x1="7.5" y1="6" x2="7.5" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="7.5" cy="10.5" r="0.7" fill="currentColor" />
    </svg>
  )
}

function SuccessIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4.5 7.5L6.5 9.5L10.5 5.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L8 8M8 1L1 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ToastItemComponent({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: (id: number) => void
}) {
  const isError = item.type === 'error'

  return (
    <div
      role="alert"
      className={`${styles.toast} ${isError ? styles.error : styles.success}`}
    >
      <span className={`${styles.icon} ${isError ? styles.iconError : styles.iconSuccess}`}>
        {isError ? <ErrorIcon /> : <SuccessIcon />}
      </span>
      <div className={styles.body}>
        <p className={styles.message}>{item.message}</p>
      </div>
      <button
        type="button"
        className={styles.close}
        onClick={() => onDismiss(item.id)}
        aria-label="Fechar notificação"
      >
        <CloseIcon />
      </button>
      <div className={`${styles.progress} ${isError ? styles.progressError : styles.progressSuccess}`} />
    </div>
  )
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    _listeners.push(setItems)
    return () => {
      _listeners = _listeners.filter(l => l !== setItems)
    }
  }, [])

  const handleDismiss = useCallback((id: number) => _remove(id), [])

  if (!items.length) return null

  return (
    <div className={styles.container}>
      {items.map(t => (
        <ToastItemComponent key={t.id} item={t} onDismiss={handleDismiss} />
      ))}
    </div>
  )
}
