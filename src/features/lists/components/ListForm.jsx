import { useState, useEffect } from 'react'
import SlugInput from './SlugInput'
import LogoUpload from './LogoUpload'

const PRESETS = [
  { name: 'Floresta',   primary_color: '#22c55e', secondary_color: '#16a34a', bg_color: '#0a0f0c', font_color: '#e8f5e9', title_color: '#a7f3d0', label_color: '#6ee7b7', item_bg_color: '#111a13' },
  { name: 'Oceano',     primary_color: '#3b82f6', secondary_color: '#2563eb', bg_color: '#0a0e1a', font_color: '#e0e8ff', title_color: '#93c5fd', label_color: '#60a5fa', item_bg_color: '#0f1625' },
  { name: 'Crepúsculo', primary_color: '#a855f7', secondary_color: '#9333ea', bg_color: '#0d0a14', font_color: '#f3e8ff', title_color: '#d8b4fe', label_color: '#c084fc', item_bg_color: '#150f20' },
  { name: 'Brasa',      primary_color: '#f97316', secondary_color: '#ea580c', bg_color: '#120a05', font_color: '#fff7ed', title_color: '#fed7aa', label_color: '#fb923c', item_bg_color: '#1a0f08' },
  { name: 'Aurora',     primary_color: '#ec4899', secondary_color: '#db2777', bg_color: '#130a10', font_color: '#fce7f3', title_color: '#f9a8d4', label_color: '#f472b6', item_bg_color: '#1c0e16' },
  { name: 'Polar',      primary_color: '#06b6d4', secondary_color: '#0891b2', bg_color: '#060d10', font_color: '#e0f7fa', title_color: '#a5f3fc', label_color: '#67e8f9', item_bg_color: '#0a1520' },
  { name: 'Âmbar',      primary_color: '#eab308', secondary_color: '#ca8a04', bg_color: '#100e05', font_color: '#fefce8', title_color: '#fef08a', label_color: '#facc15', item_bg_color: '#1a1608' },
  { name: 'Grafite',    primary_color: '#94a3b8', secondary_color: '#64748b', bg_color: '#080a0c', font_color: '#f1f5f9', title_color: '#cbd5e1', label_color: '#94a3b8', item_bg_color: '#0f1214' },
]

const DEFAULTS = {
  name: '',
  slug: '',
  primary_color: '#22c55e',
  secondary_color: '#16a34a',
  bg_color: '#0f0f0f',
  font_color: '#f0f0f0',
  title_color: '#f5f5f5',
  label_color: '#888888',
  item_bg_color: '#1e1e1e',
}

const inputCls = 'bg-[#111] border border-[#2a2a2a] rounded-lg text-[#f0f0f0] py-[0.6rem] px-3 text-[0.9rem] w-full outline-none focus:border-primary transition-[border-color]'
const labelCls = 'text-[0.75rem] text-label uppercase tracking-[0.05em]'

export default function ListForm({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(DEFAULTS)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activePreset, setActivePreset] = useState(null)

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...DEFAULTS, ...initial } : DEFAULTS)
      setLogoFile(null)
      setLogoPreview(initial?.logo_url || null)
      setActivePreset(null)
    }
  }, [open, initial])

  const set = (key, val) => {
    setActivePreset(null)
    setForm(prev => ({ ...prev, [key]: val }))
  }

  const applyPreset = (preset) => {
    setActivePreset(preset.name)
    setForm(prev => ({
      ...prev,
      primary_color: preset.primary_color,
      secondary_color: preset.secondary_color,
      bg_color: preset.bg_color,
      font_color: preset.font_color,
      title_color: preset.title_color,
      label_color: preset.label_color,
      item_bg_color: preset.item_bg_color,
    }))
  }

  const handleLogoFile = (file) => {
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.slug) return
    setSaving(true)
    try {
      await onSave(form, logoFile)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-100" onClick={onClose}>
      <div className="bg-[#1a1a1a] rounded-[20px_20px_0_0] px-5 py-6 pb-8 w-full max-w-[480px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-[1.1rem] font-bold text-text mb-5">{initial ? 'Editar lista' : 'Nova lista'}</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4 items-start">
            <LogoUpload currentUrl={logoPreview} onFile={handleLogoFile} />
            <div className="flex-1 flex flex-col gap-2">
              <label className={labelCls}>Nome da lista</label>
              <input
                className={inputCls}
                type="text"
                placeholder="Compras do Bebê"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
              />
              <label className={labelCls}>Rota (URL)</label>
              <SlugInput value={form.slug} onChange={val => set('slug', val)} excludeId={initial?.id} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className={labelCls}>Temas</span>
            <div className="grid grid-cols-4 gap-[0.4rem]">
              {PRESETS.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  className={`flex flex-col items-center gap-[5px] bg-transparent border-[1.5px] rounded-[10px] p-2 pb-1.5 cursor-pointer transition-[border-color,transform] duration-150 hover:border-[#444] hover:-translate-y-px ${activePreset === preset.name ? 'border-primary' : 'border-[#222]'}`}
                  onClick={() => applyPreset(preset)}
                  title={preset.name}
                >
                  <span
                    className="w-7 h-7 rounded-full border-2 border-white/8 shrink-0"
                    style={{ background: `linear-gradient(135deg, ${preset.primary_color}, ${preset.secondary_color})` }}
                  />
                  <span className={`text-[9px] text-center whitespace-nowrap tracking-[0.02em] ${activePreset === preset.name ? 'text-primary' : 'text-[#555]'}`}>
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Primária',       key: 'primary_color' },
              { label: 'Secundária',     key: 'secondary_color' },
              { label: 'Fundo',          key: 'bg_color' },
              { label: 'Texto',          key: 'font_color' },
              { label: 'Título',         key: 'title_color' },
              { label: 'Labels',         key: 'label_color' },
            ].map(({ label, key }) => (
              <div key={key} className="flex flex-col gap-[0.4rem] items-center">
                <label className={labelCls}>{label}</label>
                <input
                  type="color"
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  className="w-full h-9 border border-[#2a2a2a] rounded-lg bg-[#111] cursor-pointer p-0.5"
                />
              </div>
            ))}
            <div className="col-span-2 flex flex-row items-center justify-between gap-3">
              <label className={labelCls}>Fundo dos itens</label>
              <input
                type="color"
                value={form.item_bg_color}
                onChange={e => set('item_bg_color', e.target.value)}
                className="w-20 h-9 border border-[#2a2a2a] rounded-lg bg-[#111] cursor-pointer p-0.5"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              className="flex-1 bg-[#2a2a2a] text-[#ccc] border-none rounded-[10px] py-3 text-[0.9rem] font-semibold cursor-pointer"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-white border-none rounded-[10px] py-3 text-[0.9rem] font-semibold cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
