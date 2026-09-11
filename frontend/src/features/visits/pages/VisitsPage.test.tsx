import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/renderWithProviders'
import { server } from '@/test/server'
import { VisitsPage } from './VisitsPage'

describe('VisitsPage', () => {
  it('renders the visits returned by the API', async () => {
    server.use(
      http.get('/api/v1/admin/locations', () => HttpResponse.json([])),
      http.get('/api/v1/admin/visits', () =>
        HttpResponse.json([
          {
            id: '33333333-3333-3333-3333-333333333333',
            visitorName: 'Grace Hopper',
            visitorCompany: 'Navy',
            visitDate: '2026-09-11',
            purpose: 'Audit',
            hostName: 'Luca',
            contactInfo: 'grace@example.com',
            status: 'CHECKED_IN',
            locationId: '11111111-1111-1111-1111-111111111111',
            locationName: 'Hamburg HQ',
            checkedOutAt: null,
            createdAt: '2026-09-11T08:00:00Z',
            updatedAt: '2026-09-11T08:00:00Z',
          },
        ]),
      ),
    )

    renderWithProviders(<VisitsPage />)

    const card = (await screen.findByText('Grace Hopper')).closest('.MuiCard-root')
    expect(card).not.toBeNull()
    expect(within(card as HTMLElement).getByText('On site')).toBeVisible()
    expect(within(card as HTMLElement).getByText('Navy')).toBeVisible()
  })

  it('shows the empty state when no visits exist', async () => {
    server.use(
      http.get('/api/v1/admin/locations', () => HttpResponse.json([])),
      http.get('/api/v1/admin/visits', () => HttpResponse.json([])),
    )

    renderWithProviders(<VisitsPage />)

    expect(await screen.findByText('No visits yet.')).toBeVisible()
  })
})
