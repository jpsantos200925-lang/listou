import { useNavigate } from 'react-router-dom'
import type { List } from '@/types'
import styles from './ListCard.module.css'

interface ListCardProps {
  list: List
  onEdit: (list: List) => void
  onDelete: (list: List) => void
}

export default function ListCard({ list, onEdit, onDelete }: ListCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className={`${styles.card} flex items-center gap-[0.875rem] border border-l-[3px] rounded-[14px] py-[0.9rem] pr-[0.875rem] pl-4 cursor-pointer transition-[transform,box-shadow,border-color,background] duration-[180ms] ease-out relative select-none [-webkit-tap-highlight-color:transparent]`}
      style={{ '--card-primary': list.primary_color, '--card-bg': list.bg_color } as React.CSSProperties}
      onClick={() => navigate(`/${list.slug}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/${list.slug}`)}
    >
      <div className="w-11 h-11 rounded-[10px] overflow-hidden shrink-0">
        {list.logo_url ? (
          <img src={list.logo_url} alt={list.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className={`${styles.logoPlaceholder} w-full h-full flex items-center justify-center font-bold text-[1.1rem] rounded-[10px]`}
          >
            {list.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-[0.2rem]">
        <span className="text-[0.95rem] font-semibold text-[#f0f0f0]">{list.name}</span>
        <span className={`${styles.slug} text-[0.68rem] font-mono tracking-[0.01em]`}>
          /{list.slug}
        </span>
      </div>

      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
        <button
          className="bg-transparent border-none cursor-pointer p-[0.4rem] text-[#666] rounded-[6px] flex items-center justify-center transition-[color,background] duration-150 hover:text-[#aaa] hover:bg-[#2a2a2a]"
          onClick={() => onEdit(list)}
          aria-label="Editar"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          className="bg-transparent border-none cursor-pointer p-[0.4rem] text-[#666] rounded-[6px] flex items-center justify-center transition-[color,background] duration-150 hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)]"
          onClick={() => onDelete(list)}
          aria-label="Deletar"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>

      <svg
        className={`${styles.chevron} shrink-0`}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  )
}
