import { Navigate, Outlet, Route, Routes } from 'react-router'

import { useAuth } from '@/features/auth/AuthProvider'
import CodeEntryPage from '@/pages/CodeEntryPage'
import HomePage from '@/pages/HomePage'
import SignInPage from '@/pages/SignInPage'

function RequireAuth() {
  const { session, loading } = useAuth()
  if (loading) return null
  return session ? <Outlet /> : <Navigate to="/sign-in" replace />
}

function PublicOnly() {
  const { session, loading } = useAuth()
  if (loading) return null
  return session ? <Navigate to="/" replace /> : <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<HomePage />} />
      </Route>
      <Route element={<PublicOnly />}>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-in/code" element={<CodeEntryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
