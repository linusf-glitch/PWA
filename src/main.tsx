import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import './index.css'
import App from './App.tsx'
import { SvgDefs } from '@/components/illustration/illustration'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { getSupabase } from '@/lib/supabase'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SvgDefs />
    <BrowserRouter>
      <AuthProvider client={getSupabase()}>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
