import { NavLink, Outlet, useLocation } from 'react-router'
import { cn } from '@/lib/cn'
import { NAV_ITEMS } from './navItems'

function BottomNav() {
  return (
    <nav
      aria-label="Principal"
      className="bg-primary fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgb(232_93_93/0.3)]"
    >
      <ul className="grid h-16 grid-cols-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'group relative flex h-full flex-col items-center justify-center gap-[3px] text-[10px] font-medium transition-colors duration-200',
                  isActive ? 'text-white' : 'text-white/65 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Indicador da aba ativa */}
                  <span
                    className={cn(
                      'absolute top-0 h-[3px] w-8 rounded-b-full bg-white transition-transform duration-300 ease-(--ease-out-expo)',
                      isActive ? 'scale-x-100' : 'scale-x-0',
                    )}
                    aria-hidden
                  />
                  <Icon
                    className={cn(
                      'size-[22px] transition-transform duration-300 ease-(--ease-spring) group-hover:-translate-y-0.5',
                      isActive && '-translate-y-0.5',
                    )}
                    strokeWidth={isActive ? 2.4 : 2}
                    aria-hidden
                  />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * Coluna do app (480px no desktop, como no protótipo).
 * `focus` esconde a barra inferior em telas de formulário e de ação principal.
 */
export function AppLayout({ focus = false }) {
  const { pathname } = useLocation()

  return (
    <div className="app-shell">
      {/* A key reinicia a animação de entrada a cada troca de página. */}
      <main key={pathname} className={cn('animate-page', focus ? 'pb-8' : 'pb-24')}>
        <Outlet />
      </main>
      {!focus && <BottomNav />}
    </div>
  )
}
