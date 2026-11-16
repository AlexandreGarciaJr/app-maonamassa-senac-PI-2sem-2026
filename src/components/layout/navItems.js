import { CalendarDays, House, UserRound, Users } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

/** Itens da barra de navegação inferior (mesmos do protótipo). */
export const NAV_ITEMS = [
  { to: ROUTES.home, label: 'Home', icon: House, end: true },
  { to: ROUTES.services, label: 'Profissionais', icon: Users },
  { to: ROUTES.schedule, label: 'Agenda', icon: CalendarDays },
  { to: ROUTES.profile, label: 'Perfil', icon: UserRound },
]
