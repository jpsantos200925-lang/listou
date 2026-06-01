import { useState, useEffect, useRef } from 'react'
import { checkSlugAvailable } from '../services/lists.service'
import { supabase } from '@/shared/services/supabaseClient'

function sanitizeSlug(value) {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const statusCls = {
  checking: 'text-[#888]',
  available: 'text-green-500',
  taken: 'text-[#ef4444]',
}

const statusLabel = {
  checking: 'verificando...',
  available: '✓ disponível',
  taken: '✗ já existe',
}

const inputCls = 'bg-[#111] border border-[#2a2a2a] rounded-lg text-text py-[0.6rem] px-3 text-[0.9rem] w-full outline-none focus:border-primary transition-[border-color]'

export default function SlugInput({ value, onChange, excludeId }) {
  const [status, setStatus] = useState(null)
  const timerRef = useRef(null)

  const handleChange = (e) => {
    const sanitized = sanitizeSlug(e.target.value)
    onChange(sanitized)
  }

  useEffect(() => {
    if (!value) { setStatus(null); return }
    setStatus('checking')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        let available = await checkSlugAvailable(value)
        if (!available && excludeId) {
          const { data } = await supabase.from('lists').select('id').eq('slug', value).single()
          if (data?.id === excludeId) available = true
        }
        setStatus(available ? 'available' : 'taken')
      } catch {
        setStatus(null)
      }
    }, 500)
    return () => clearTimeout(timerRef.current)
  }, [value, excludeId])

  return (
    <div className="flex flex-col gap-1">
      <input
        className={inputCls}
        type="text"
        placeholder="minha-lista"
        value={value}
        onChange={handleChange}
        maxLength={50}
      />
      {status && (
        <span className={`text-[0.72rem] pl-1 ${statusCls[status]}`}>
          {statusLabel[status]}
        </span>
      )}
    </div>
  )
}
