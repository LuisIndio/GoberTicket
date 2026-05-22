import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TicketsPage } from './pages/TicketsPage'
import { TicketDetailPage } from './pages/TicketDetailPage'
import { NewTicketPage } from './pages/NewTicketPage'
import { UsersPage } from './pages/UsersPage'

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
})

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <Layout>{children}</Layout>
}

// Ruta accesible sin sesión; muestra Layout solo si está autenticado
function PublicOrAuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Layout>{children}</Layout>
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/tickets/new" replace />} />

          <Route path="/dashboard" element={
            <PrivateRoute><DashboardPage /></PrivateRoute>
          } />
          <Route path="/tickets" element={
            <PrivateRoute><TicketsPage /></PrivateRoute>
          } />
          <Route path="/tickets/new" element={
            <PublicOrAuthRoute><NewTicketPage /></PublicOrAuthRoute>
          } />
          <Route path="/tickets/:id" element={
            <PrivateRoute><TicketDetailPage /></PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute roles={['Admin']}><UsersPage /></PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
