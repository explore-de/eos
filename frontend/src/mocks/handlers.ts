import { http, HttpResponse } from 'msw'

import type { SelfCheckInRequest, Visit, VisitCreateRequest, VisitStatus } from '@/api/eosApi'
import { demoLocations, demoVisits } from './fixtures'

const visits = new Map(demoVisits.map((visit) => [visit.id, { ...visit }]))
const locations = new Map(demoLocations.map((location) => [location.id, { ...location }]))

const badge = (visit: Visit) => ({
  id: visit.id,
  visitorName: visit.visitorName,
  visitorCompany: visit.visitorCompany,
  visitDate: visit.visitDate,
  purpose: visit.purpose,
  hostName: visit.hostName,
  status: visit.status,
  checkInAt: visit.checkInAt,
  checkOutAt: visit.checkOutAt,
  location: locations.get(visit.locationId) ?? demoLocations[0],
})

const notFound = () =>
  HttpResponse.json({ type: 'about:blank', title: 'Not Found', status: 404 }, { status: 404 })

export const handlers = [
  http.get('/api/v1/me', () =>
    HttpResponse.json({
      subject: 'demo-admin',
      name: 'Demo Admin',
      email: 'admin@example.com',
      roles: ['eos-admin'],
      locationIds: [],
    }),
  ),

  http.get('/api/v1/public/locations/:locationId', ({ params }) => {
    const location = locations.get(String(params.locationId))
    return location ? HttpResponse.json(location) : notFound()
  }),

  http.post('/api/v1/public/visits', async ({ request }) => {
    const body = (await request.json()) as SelfCheckInRequest
    const visit: Visit = {
      id: `demo-${visits.size + 1}`,
      locationId: body.locationId,
      visitorName: body.visitorName,
      visitorCompany: body.visitorCompany,
      visitDate: new Date().toISOString().slice(0, 10),
      purpose: body.purpose,
      hostName: body.hostName,
      contact: body.contact,
      status: 'ON_SITE',
      checkInAt: new Date().toISOString(),
      checkOutAt: null,
      selfRegistered: true,
      createdAt: new Date().toISOString(),
      createdBy: null,
    }
    visits.set(visit.id, visit)
    return HttpResponse.json(
      { visit: badge(visit), visitToken: 'demo-visit-token', badgeUrl: `/visit/${visit.id}` },
      { status: 201 },
    )
  }),

  http.get('/api/v1/public/visits/:visitId', ({ params }) => {
    const visit = visits.get(String(params.visitId))
    return visit ? HttpResponse.json(badge(visit)) : notFound()
  }),

  http.post('/api/v1/public/visits/:visitId/checkout', ({ params }) => {
    const visit = visits.get(String(params.visitId))
    if (!visit) return notFound()
    visit.status = 'CHECKED_OUT'
    visit.checkOutAt = new Date().toISOString()
    return HttpResponse.json(badge(visit))
  }),

  http.get('/api/v1/visits', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.getAll('status') as VisitStatus[]
    const locationId = url.searchParams.get('locationId')
    const q = url.searchParams.get('q')?.toLowerCase()

    const items = [...visits.values()].filter(
      (visit) =>
        (status.length === 0 || status.includes(visit.status)) &&
        (!locationId || visit.locationId === locationId) &&
        (!q ||
          [visit.visitorName, visit.visitorCompany, visit.hostName]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(q))),
    )

    return HttpResponse.json({
      items,
      page: 0,
      size: items.length,
      totalElements: items.length,
      totalPages: 1,
    })
  }),

  http.post('/api/v1/visits', async ({ request }) => {
    const body = (await request.json()) as VisitCreateRequest
    const visit: Visit = {
      id: `demo-${visits.size + 1}`,
      locationId: body.locationId,
      visitorName: body.visitorName,
      visitorCompany: body.visitorCompany,
      visitDate: body.visitDate,
      purpose: body.purpose,
      hostName: body.hostName,
      contact: body.contact,
      status: 'EXPECTED',
      checkInAt: null,
      checkOutAt: null,
      selfRegistered: false,
      createdAt: new Date().toISOString(),
      createdBy: 'demo-admin',
    }
    visits.set(visit.id, visit)
    return HttpResponse.json(visit, { status: 201 })
  }),

  http.post('/api/v1/visits/:visitId/checkin', ({ params }) => {
    const visit = visits.get(String(params.visitId))
    if (!visit) return notFound()
    visit.status = 'ON_SITE'
    visit.checkInAt = new Date().toISOString()
    return HttpResponse.json(visit)
  }),

  http.post('/api/v1/visits/:visitId/checkout', ({ params }) => {
    const visit = visits.get(String(params.visitId))
    if (!visit) return notFound()
    visit.status = 'CHECKED_OUT'
    visit.checkOutAt = new Date().toISOString()
    return HttpResponse.json(visit)
  }),

  http.delete('/api/v1/visits/:visitId', ({ params }) => {
    visits.delete(String(params.visitId))
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/v1/locations', () => HttpResponse.json([...locations.values()])),

  http.delete('/api/v1/locations/:locationId', ({ params }) => {
    const location = locations.get(String(params.locationId))
    if (!location) return notFound()
    location.active = false
    return new HttpResponse(null, { status: 204 })
  }),
]
