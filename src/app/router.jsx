import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { RootLayout } from '@/components/layout/RootLayout'
import { Spinner } from '@/components/ui'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import NotFoundPage from '@/pages/NotFoundPage'
import RouteErrorPage from '@/pages/RouteErrorPage'

/** Carrega cada página sob demanda (code splitting por rota). */
const page = (loader) => async () => ({ Component: (await loader()).default })

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <Spinner className="py-24" />,
    children: [
      // Telas com a barra de navegação inferior
      {
        element: <AppLayout />,
        children: [
          { index: true, lazy: page(() => import('@/features/services/pages/HomePage')) },
          { path: 'servicos', lazy: page(() => import('@/features/services/pages/ServicesPage')) },
          { path: 'agenda', lazy: page(() => import('@/features/hiring/pages/AgendaPage')) },
          { path: 'perfil', lazy: page(() => import('@/features/profile/pages/ProfilePage')) },
        ],
      },

      // Telas de formulário e ação principal (sem barra inferior, como no protótipo)
      {
        element: <AppLayout focus />,
        children: [
          { path: 'login', lazy: page(() => import('@/features/auth/pages/LoginPage')) },
          { path: 'cadastro', lazy: page(() => import('@/features/auth/pages/RegisterPage')) },
          {
            path: 'servicos/:serviceId',
            lazy: page(() => import('@/features/services/pages/ServiceDetailPage')),
          },
          {
            element: <ProtectedRoute />,
            children: [
              {
                path: 'servicos/:serviceId/contratar',
                lazy: page(() => import('@/features/hiring/pages/HireServicePage')),
              },
              {
                path: 'contratacoes/:requestId/confirmacao',
                lazy: page(() => import('@/features/hiring/pages/HireSuccessPage')),
              },
            ],
          },
          {
            element: <ProtectedRoute roles={['prestador']} />,
            children: [
              {
                path: 'prestador/servicos/novo',
                lazy: page(() => import('@/features/services/pages/CreateServicePage')),
              },
              {
                // Mesmo formulário do cadastro, preenchido com o serviço existente.
                path: 'prestador/servicos/:serviceId/editar',
                lazy: page(() => import('@/features/services/pages/CreateServicePage')),
              },
            ],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
