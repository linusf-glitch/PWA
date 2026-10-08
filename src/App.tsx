import { Navigate, Outlet, Route, Routes } from 'react-router'

import { AppShell } from '@/components/shell/app-shell'
import { useAuth } from '@/features/auth/AuthProvider'
import AccountPage from '@/pages/AccountPage'
import CodeEntryPage from '@/pages/CodeEntryPage'
import HomePage from '@/pages/HomePage'
import PlaceholderPage from '@/pages/PlaceholderPage'
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
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/growth" element={<PlaceholderPage title="Wachstum" />} />
          <Route path="/shoes" element={<PlaceholderPage title="Schuhe" />} />
          <Route path="/scan" element={<PlaceholderPage title="Scan" />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>
      </Route>
      <Route element={<PublicOnly />}>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-in/code" element={<CodeEntryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
