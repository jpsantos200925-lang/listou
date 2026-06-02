import { useAuth } from '@/features/auth'
import AppRoutes from './routes'
import ErrorBoundary from '@/shared/components/ErrorBoundary'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) return null

  return (
    <ErrorBoundary>
      <AppRoutes session={session} />
    </ErrorBoundary>
  )
}
