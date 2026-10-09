import { Navigate, Outlet, Route, Routes } from 'react-router'

import { AppShell } from '@/components/shell/app-shell'
import { useAuth } from '@/features/auth/AuthProvider'
import AccountPage from '@/pages/AccountPage'
import CodeEntryPage from '@/pages/CodeEntryPage'
import ColourwayPage from '@/pages/ColourwayPage'
import HomePage from '@/pages/HomePage'
import OrderConfirmedPage from '@/pages/OrderConfirmedPage'
import PaymentDonePage from '@/pages/PaymentDonePage'
import PlaceholderPage from '@/pages/PlaceholderPage'
import ReturnPage from '@/pages/ReturnPage'
import ScanPage from '@/pages/ScanPage'
import ScanResultPage from '@/pages/ScanResultPage'
import SettingExplainPage from '@/pages/SettingExplainPage'
import ShoeDetailPage from '@/pages/ShoeDetailPage'
import ShoesPage from '@/pages/ShoesPage'
import SignInPage from '@/pages/SignInPage'

function RequireAuth() {
  const { session, configured, loading } = useAuth()
  if (loading) return null
  // ponytail: demo mode while Supabase keys are missing (Vercel previews). Everything shown is
  // sample data, so nothing private is exposed. Remove once screens read real data.
  if (!configured) {
    return (
      <>
        <p role="note" className="bg-warning-soft px-4 py-2 text-center text-caption text-warning">
          Demo mit Beispieldaten. Die Anmeldung ist noch nicht eingerichtet.
        </p>
        <Outlet />
      </>
    )
  }
  return session ? <Outlet /> : <Navigate to="/sign-in" replace />
}

function PublicOnly() {
  const { session, configured, loading } = useAuth()
  if (loading) return null
  // In demo mode there is nothing to sign in to, so old /sign-in links land on the demo too.
  return session || !configured ? <Navigate to="/" replace /> : <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/growth" element={<PlaceholderPage title="Wachstum" />} />
          <Route path="/shoes" element={<ShoesPage />} />
          <Route path="/shoes/:id" element={<ShoeDetailPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/scan/result" element={<ScanResultPage />} />
          <Route path="/scan/setting" element={<SettingExplainPage />} />
          <Route path="/checkout" element={<ColourwayPage />} />
          <Route path="/order/done" element={<PaymentDonePage />} />
          <Route path="/order/confirmed" element={<OrderConfirmedPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>
      </Route>
      <Route path="/return" element={<ReturnPage />} />
      <Route element={<PublicOnly />}>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-in/code" element={<CodeEntryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
