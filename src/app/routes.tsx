import { Routes, Route, Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import ListDetail from '@/pages/ListDetail'

interface AppRoutesProps {
  session: Session | null | undefined
}

export default function AppRoutes({ session }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
      <Route path="/" element={session ? <Home /> : <Navigate to="/login" />} />
      <Route path="/:slug" element={session ? <ListDetail /> : <Navigate to="/login" />} />
    </Routes>
  )
}
