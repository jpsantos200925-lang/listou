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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{initial ? 'Editar lista' : 'Nova lista'}</h2>
        <form onSubmit={handleSubmit} className="list-form">
          <div className="form-row">
            <LogoUpload currentUrl={logoPreview} onFile={handleLogoFile} />
            <div className="form-fields">
              <label className="form-label">Nome da lista</label>
              <input
                className="form-input"
                type="text"
                placeholder="Compras do Bebê"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
              />
              <label className="form-label">Rota (URL)</label>
              <SlugInput value={form.slug} onChange={val => set('slug', val)} excludeId={initial?.id} />
            </div>
          </div>

          <div className="presets-section">
            <span className="form-label">Temas</span>
            <div className="presets-grid">
              {PRESETS.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  className={`preset-swatch${activePreset === preset.name ? ' active' : ''}`}
                  onClick={() => applyPreset(preset)}
                  title={preset.name}
                >
                  <span
                    className="preset-dot"
                    style={{ background: `linear-gradient(135deg, ${preset.primary_color}, ${preset.secondary_color})` }}
                  />
                  <span className="preset-name">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="color-row">
            <div className="color-field">
              <label className="form-label">Primária</label>
              <input type="color" value={form.primary_color} onChange={e => set('primary_color', e.target.value)} />
            </div>
            <div className="color-field">
              <label className="form-label">Secundária</label>
              <input type="color" value={form.secondary_color} onChange={e => set('secondary_color', e.target.value)} />
            </div>
            <div className="color-field">
              <label className="form-label">Fundo</label>
              <input type="color" value={form.bg_color} onChange={e => set('bg_color', e.target.value)} />
            </div>
            <div className="color-field">
              <label className="form-label">Texto</label>
              <input type="color" value={form.font_color} onChange={e => set('font_color', e.target.value)} />
            </div>
            <div className="color-field">
              <label className="form-label">Título</label>
              <input type="color" value={form.title_color} onChange={e => set('title_color', e.target.value)} />
            </div>
            <div className="color-field">
              <label className="form-label">Labels</label>
              <input type="color" value={form.label_color} onChange={e => set('label_color', e.target.value)} />
            </div>
            <div className="color-field color-field--full">
              <label className="form-label">Fundo dos itens</label>
              <input type="color" value={form.item_bg_color} onChange={e => set('item_bg_color', e.target.value)} />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
