import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSession, onAuthStateChange } from '../services/auth.service'

export function useAuth(): { session: Session | null | undefined; loading: boolean } {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = onAuthStateChange(async (_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  return { session, loading: session === undefined }
}
