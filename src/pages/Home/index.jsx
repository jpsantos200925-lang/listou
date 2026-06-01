import { useState } from 'react'
import { signOut } from '@/features/auth'
import { useLists, ListCard, ListForm } from '@/features/lists'

export default function Home() {
  const { lists, loading, addList, editList, removeList } = useLists()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleSave = async (form, logoFile) => {
    if (editing) {
      await editList(editing.id, form, logoFile)
    } else {
      await addList(form, logoFile)
    }
    setEditing(null)
  }

  const handleEdit = (list) => {
    setEditing(list)
    setFormOpen(true)
  }

  const handleDelete = async (list) => {
    if (window.confirm(`Deletar a lista "${list.name}"? Todos os itens serão perdidos.`)) {
      await removeList(list.id)
    }
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 w-full h-dvh flex flex-col overflow-hidden animate-fade-in bg-[#0f0f0f]">

      <header className="flex items-center justify-between py-5 pb-4 border-b border-border mb-6">
        <span className="font-syne font-extrabold text-[1.2rem] tracking-[-0.03em] text-[#f5f5f5] flex items-center gap-2">
          <span className="w-[22px] h-[22px] rounded-[6px] bg-primary flex items-center justify-center shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
          Listou
        </span>
        <button
          className="flex items-center gap-[6px] py-[7px] px-3 bg-surface-2 border border-border rounded-[20px] text-text-2 font-body text-xs font-medium tracking-[.03em] cursor-pointer transition-all hover:border-border-lt hover:text-text-1"
          onClick={signOut}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sair
        </button>
      </header>

      <main className="px-4 py-6 flex flex-col gap-3 flex-1">
        {loading ? (
          <div className="flex gap-[6px] justify-center p-10">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-dim animate-pulse-dot" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold-dim animate-pulse-dot [animation-delay:.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold-dim animate-pulse-dot [animation-delay:.4s]" />
          </div>
        ) : lists.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 p-12">
            <div className="w-[72px] h-[72px] rounded-full border-[1.5px] border-dashed border-[#2e2e2e] flex items-center justify-center text-[#3a3a3a]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <div className="text-center flex flex-col gap-[0.4rem]">
              <p className="text-[0.95rem] font-semibold text-[#666]">Nenhuma lista ainda</p>
              <p className="text-[0.8rem] text-[#444] leading-relaxed">Toque no botão abaixo para criar<br/>sua primeira lista personalizada.</p>
            </div>
          </div>
        ) : (
          lists.map(list => (
            <ListCard key={list.id} list={list} onEdit={handleEdit} onDelete={handleDelete} />
          ))
        )}
      </main>

      <button
        className="fixed right-[max(20px,env(safe-area-inset-right))] bottom-[max(24px,env(safe-area-inset-bottom))] w-14 h-14 rounded-full border-none text-white flex items-center justify-center cursor-pointer z-50 animate-[fadeUp_.4s_ease_.2s_both] transition-[transform,box-shadow] hover:-translate-y-0.5 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 8px 24px rgba(59,130,246,.32), 0 2px 6px rgba(0,0,0,.08)' }}
        onClick={() => { setEditing(null); setFormOpen(true) }}
        aria-label="Nova lista"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <ListForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  )
}
