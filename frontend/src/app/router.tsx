import { createBrowserRouter, Navigate } from 'react-router'

import { LocationsPage } from '@/features/locations/pages/LocationsPage'
import { LogoutPage } from '@/features/auth/LogoutPage'
import { OnSitePage } from '@/features/visits/pages/OnSitePage'
import { VisitsPage } from '@/features/visits/pages/VisitsPage'
import { BadgePage } from '@/features/visitor/pages/BadgePage'
import { CheckInPage } from '@/features/visitor/pages/CheckInPage'
import { ScanPromptPage } from '@/features/visitor/pages/ScanPromptPage'
import { RequireAdmin } from '@/features/auth/RequireAdmin'
import { AdminLayout } from '@/layouts/AdminLayout'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { VisitorLayout } from '@/layouts/VisitorLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: VisitorLayout,
    children: [
      { index: true, Component: ScanPromptPage },
      { path: 'check-in/:locationId', Component: CheckInPage },
      { path: 'visit/:visitId', Component: BadgePage },
      { path: '*', Component: NotFoundPage },
    ],
  },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/visits" replace /> },
      { path: 'visits', Component: VisitsPage },
      { path: 'on-site', Component: OnSitePage },
      { path: 'locations', Component: LocationsPage },
      { path: 'logout', Component: LogoutPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
