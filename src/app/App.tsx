import { useAuth } from '@/features/auth'
import AppRoutes from './routes'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import { Toaster } from '@/shared/components/Toast'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) return null

  return (
    <ErrorBoundary>
      <AppRoutes session={session} />
      <Toaster />
    </ErrorBoundary>
  )
}
