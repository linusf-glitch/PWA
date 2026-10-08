import { Footprints, House, TrendingUp, UserRound, type LucideIcon } from 'lucide-react'

// One route list for the desktop sidebar and the mobile Home cards. No bottom tab bar.
export const NAV: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Home', icon: House },
  { to: '/growth', label: 'Wachstum', icon: TrendingUp },
  { to: '/shoes', label: 'Schuhe', icon: Footprints },
  { to: '/account', label: 'Konto', icon: UserRound },
]
