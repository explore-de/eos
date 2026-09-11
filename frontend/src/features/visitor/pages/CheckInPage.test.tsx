import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/renderWithProviders'
import { server } from '@/test/server'
import { CheckInPage } from './CheckInPage'

const LOCATION_ID = '11111111-1111-1111-1111-111111111111'

describe('CheckInPage', () => {
  it('posts the self check-in and stores the returned visit token', async () => {
    const selfCheckIn = vi.fn()
    server.use(
      http.get(`/api/v1/public/locations/${LOCATION_ID}`, () =>
        HttpResponse.json({
          id: LOCATION_ID,
          companyName: 'Hamburg HQ',
          address: { street: 'Hafenstr. 1', postalCode: '20095', city: 'Hamburg', country: 'DE' },
          hostRequired: false,
        }),
      ),
      http.post('/api/v1/public/visits', async ({ request }) => {
        selfCheckIn(await request.json())
        return HttpResponse.json(
          {
            visit: {
              id: '22222222-2222-2222-2222-222222222222',
              visitorName: 'Ada Lovelace',
              visitDate: '2026-09-11',
              status: 'ON_SITE',
              location: {
                id: LOCATION_ID,
                companyName: 'Hamburg HQ',
                address: {
                  street: 'Hafenstr. 1',
                  postalCode: '20095',
                  city: 'Hamburg',
                  country: 'DE',
                },
              },
            },
            visitToken: 'token-abc',
            badgeUrl: '/visit/22222222-2222-2222-2222-222222222222',
          },
          { status: 201 },
        )
      }),
    )

    const { store } = renderWithProviders(<CheckInPage />, {
      route: `/check-in/${LOCATION_ID}`,
      path: '/check-in/:locationId',
    })

    await screen.findByText('Hamburg HQ')
    await userEvent.type(screen.getByLabelText(/^Name/), 'Ada Lovelace')
    await userEvent.type(screen.getByLabelText(/^Purpose/), 'Workshop')
    await userEvent.type(screen.getByLabelText(/^Email/), 'ada@example.com')
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Check in' }))

    await waitFor(() => expect(selfCheckIn).toHaveBeenCalledOnce())
    expect(selfCheckIn).toHaveBeenCalledWith({
      locationId: LOCATION_ID,
      visitorName: 'Ada Lovelace',
      purpose: 'Workshop',
      contact: { text: 'ada@example.com', email: 'ada@example.com' },
      privacyConsent: true,
    })
    await waitFor(() => expect(store.getState().auth.visitToken).toBe('token-abc'))
  })

  it('keeps submit disabled until required fields and consent are given', async () => {
    server.use(
      http.get(`/api/v1/public/locations/${LOCATION_ID}`, () =>
        HttpResponse.json({
          id: LOCATION_ID,
          companyName: 'Hamburg HQ',
          address: { street: 'Hafenstr. 1', postalCode: '20095', city: 'Hamburg', country: 'DE' },
          hostRequired: false,
        }),
      ),
    )

    renderWithProviders(<CheckInPage />, {
      route: `/check-in/${LOCATION_ID}`,
      path: '/check-in/:locationId',
    })

    expect(await screen.findByRole('button', { name: 'Check in' })).toBeDisabled()
  })
})
