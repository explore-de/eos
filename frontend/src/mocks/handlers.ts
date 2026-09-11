import { http, HttpResponse } from 'msw'

import type { Visit, VisitRequest, VisitStatus } from '@/api/types'
import type { SelfCheckInRequest } from '@/api/publicApi'
import { demoLocations, demoVisits } from './fixtures'

const visits = new Map(demoVisits.map((visit) => [visit.id, { ...visit }]))
const locations = new Map(demoLocations.map((location) => [location.id, { ...location }]))

const ADMIN = '/api/v1/admin'
const PUBLIC = '/api/v1/public'

const notFound = () =>
  HttpResponse.json({ type: 'about:blank', title: 'Not Found', status: 404 }, { status: 404 })

const now = () => new Date().toISOString()

const locationName = (locationId: string) =>
  locations.get(locationId)?.companyName ?? 'Unknown location'

export const handlers = [
  http.get(`${PUBLIC}/locations/:locationId`, ({ params }) => {
    const location = locations.get(String(params.locationId))
    return location ? HttpResponse.json(location) : notFound()
  }),

  http.post(`${PUBLIC}/visits`, async ({ request }) => {
    const body = (await request.json()) as SelfCheckInRequest
    const visit: Visit = {
      id: `demo-${visits.size + 1}`,
      visitorName: body.visitorName,
      visitorCompany: body.visitorCompany ?? null,
      visitDate: now().slice(0, 10),
      purpose: body.purpose,
      hostName: body.hostName ?? '—',
      contactInfo: body.contactInfo,
      status: 'CHECKED_IN',
      locationId: body.locationId,
      locationName: locationName(body.locationId),
      checkedOutAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    visits.set(visit.id, visit)
    return HttpResponse.json({ visit, visitToken: 'demo-visit-token' }, { status: 201 })
  }),

  http.get(`${PUBLIC}/visits/:visitId`, ({ params }) => {
    const visit = visits.get(String(params.visitId))
    return visit ? HttpResponse.json(visit) : notFound()
  }),

  http.post(`${PUBLIC}/visits/:visitId/checkout`, ({ params }) => {
    const visit = visits.get(String(params.visitId))
    if (!visit) return notFound()
    visit.status = 'CHECKED_OUT'
    visit.checkedOutAt = now()
    return HttpResponse.json(visit)
  }),

  http.get(`${ADMIN}/visits`, ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status') as VisitStatus | null
    const locationId = url.searchParams.get('locationId')
    const date = url.searchParams.get('date')

    const items = [...visits.values()].filter(
      (visit) =>
        (!status || visit.status === status) &&
        (!locationId || visit.locationId === locationId) &&
        (!date || visit.visitDate === date),
    )

    return HttpResponse.json(items)
  }),

  http.post(`${ADMIN}/visits`, async ({ request }) => {
    const body = (await request.json()) as VisitRequest
    const visit: Visit = {
      id: `demo-${visits.size + 1}`,
      visitorName: body.visitorName,
      visitorCompany: body.visitorCompany ?? null,
      visitDate: body.visitDate,
      purpose: body.purpose,
      hostName: body.hostName,
      contactInfo: body.contactInfo ?? null,
      status: body.status ?? 'REGISTERED',
      locationId: body.locationId,
      locationName: locationName(body.locationId),
      checkedOutAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    visits.set(visit.id, visit)
    return HttpResponse.json(visit, { status: 201 })
  }),

  http.put(`${ADMIN}/visits/:visitId`, async ({ params, request }) => {
    const visit = visits.get(String(params.visitId))
    if (!visit) return notFound()
    const body = (await request.json()) as VisitRequest
    const updated: Visit = {
      ...visit,
      ...body,
      visitorCompany: body.visitorCompany ?? null,
      contactInfo: body.contactInfo ?? null,
      status: body.status ?? visit.status,
      locationName: locationName(body.locationId),
      updatedAt: now(),
    }
    visits.set(updated.id, updated)
    return HttpResponse.json(updated)
  }),

  http.post(`${ADMIN}/visits/:visitId/check-out`, ({ params }) => {
    const visit = visits.get(String(params.visitId))
    if (!visit) return notFound()
    visit.status = 'CHECKED_OUT'
    visit.checkedOutAt = now()
    return HttpResponse.json(visit)
  }),

  http.delete(`${ADMIN}/visits/:visitId`, ({ params }) => {
    visits.delete(String(params.visitId))
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${ADMIN}/locations`, () => HttpResponse.json([...locations.values()])),

  http.delete(`${ADMIN}/locations/:locationId`, ({ params }) => {
    locations.delete(String(params.locationId))
    return new HttpResponse(null, { status: 204 })
  }),
]
