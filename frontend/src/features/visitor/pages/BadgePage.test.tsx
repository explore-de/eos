import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { createStore } from '@/app/store'
import { visitSessionStarted } from '@/features/auth/authSlice'
import { renderWithProviders } from '@/test/renderWithProviders'
import { server } from '@/test/server'
import { BadgePage } from './BadgePage'

const VISIT_ID = '22222222-2222-2222-2222-222222222222'
const LOCATION_ID = '11111111-1111-1111-1111-111111111111'

const badge = (status: string) => ({
  id: VISIT_ID,
  visitorName: 'Ada Lovelace',
  visitorCompany: 'Analytical Engines',
  visitDate: '2026-09-11',
  purpose: 'Workshop',
  hostName: 'Grace Hopper',
  contactInfo: 'ada@example.test',
  status,
  locationId: LOCATION_ID,
  locationName: 'Hamburg HQ',
  checkedOutAt: null,
  createdAt: '2026-09-11T08:00:00Z',
  updatedAt: '2026-09-11T08:00:00Z',
})

function storeWithSession() {
  const store = createStore()
  store.dispatch(visitSessionStarted({ visitId: VISIT_ID, visitToken: 'token-abc' }))
  return store
}

describe('BadgePage', () => {
  it('shows the visitor card for the checked-in visit', async () => {
    server.use(
      http.get(`/api/v1/public/visits/${VISIT_ID}`, () => HttpResponse.json(badge('CHECKED_IN'))),
    )

    renderWithProviders(<BadgePage />, {
      store: storeWithSession(),
      route: `/visit/${VISIT_ID}`,
      path: '/visit/:visitId',
    })

    expect(await screen.findByText('Ada Lovelace')).toBeVisible()
    expect(screen.getByText('Hamburg HQ')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Check out' })).toBeEnabled()
  })

  it('ends the visit session when the visitor checks out', async () => {
    const checkOut = vi.fn()
    server.use(
      http.get(`/api/v1/public/visits/${VISIT_ID}`, () => HttpResponse.json(badge('CHECKED_IN'))),
      http.post(`/api/v1/public/visits/${VISIT_ID}/checkout`, () => {
        checkOut()
        return HttpResponse.json(badge('CHECKED_OUT'))
      }),
    )

    const store = storeWithSession()
    renderWithProviders(<BadgePage />, {
      store,
      route: `/visit/${VISIT_ID}`,
      path: '/visit/:visitId',
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Check out' }))

    await waitFor(() => expect(checkOut).toHaveBeenCalledOnce())
    await waitFor(() => expect(store.getState().auth.visit).toBeNull())
    expect(screen.getByText('You are checked out. Thank you for your visit.')).toBeVisible()
  })

  it('ends the session when the visit is gone, so the visitor can register again', async () => {
    server.use(
      http.get(`/api/v1/public/visits/${VISIT_ID}`, () =>
        HttpResponse.json(
          { type: 'about:blank', title: 'Not Found', status: 404 },
          { status: 404 },
        ),
      ),
    )

    const store = storeWithSession()
    renderWithProviders(<BadgePage />, {
      store,
      route: `/visit/${VISIT_ID}`,
      path: '/visit/:visitId',
    })

    await waitFor(() => expect(store.getState().auth.visit).toBeNull())
  })

  it('tells the visitor to see reception when no session exists', () => {
    renderWithProviders(<BadgePage />, { route: `/visit/${VISIT_ID}`, path: '/visit/:visitId' })

    expect(screen.getByText(/cannot be opened on this device/)).toBeVisible()
  })
})
