import { createBrowserRouter, Navigate } from 'react-router'

import { LocationsPage } from '../features/admin/LocationsPage'
import { LogoutPage } from '../features/admin/LogoutPage'
import { OnSitePage } from '../features/admin/OnSitePage'
import { VisitsPage } from '../features/admin/VisitsPage'
import { BadgePage } from '../features/visitor/BadgePage'
import { CheckInPage } from '../features/visitor/CheckInPage'
import { ScanPromptPage } from '../features/visitor/ScanPromptPage'
import { AdminLayout } from './AdminLayout'
import { NotFoundPage } from './NotFoundPage'
import { VisitorLayout } from './VisitorLayout'

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
    Component: AdminLayout,
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
