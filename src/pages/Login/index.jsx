import { useState } from 'react'
import { signIn } from '@/features/auth'
import styles from './Login.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn(email, password)
    } catch {
      setError('E-mail ou senha inválidos.')
    }
    setLoading(false)
  }

  return (
    <div className={`${styles.page} min-h-screen flex items-center justify-center p-6 animate-fade-in`}>
      <div className="w-full max-w-[360px] bg-[#141414] border border-[#222] rounded-[20px] px-8 pt-10 pb-11 animate-[fadeUp_.6s_ease_both]">

        <div className="text-center mb-9 flex flex-col items-center gap-3">
          <span className="w-12 h-12 rounded-[14px] mb-1 bg-primary flex items-center justify-center shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
          <h1 className="font-syne text-[2rem] font-extrabold text-[#f5f5f5] tracking-[-0.04em] leading-none">
            Listou
          </h1>
          <p className="text-[0.78rem] text-[#444] tracking-[.03em]">suas listas, do seu jeito</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[11px] font-medium tracking-[.08em] uppercase text-[#555]">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
              enterKeyHint="next"
              className={`${styles.input} w-full px-3.5 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-[8px] text-[#f0f0f0] text-base font-body outline-none transition-[border-color,box-shadow] placeholder:text-[#3a3a3a]`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[11px] font-medium tracking-[.08em] uppercase text-[#555]">
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              enterKeyHint="go"
              className={`${styles.input} w-full px-3.5 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-[8px] text-[#f0f0f0] text-base font-body outline-none transition-[border-color,box-shadow] placeholder:text-[#3a3a3a]`}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[rgba(160,69,53,.1)] border border-[rgba(160,69,53,.25)] rounded-[6px] text-[13px] text-red animate-[fadeUp_.2s_ease]">
              <span>⚠</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[13px] mt-1 border-none rounded-[8px] bg-[linear-gradient(135deg,var(--color-gold),var(--color-gold-lt))] text-white font-body text-sm font-semibold tracking-[.04em] cursor-pointer transition-[opacity,transform] hover:not-disabled:opacity-90 hover:not-disabled:-translate-y-px active:not-disabled:translate-y-0 disabled:opacity-50 disabled:cursor-default"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
