import type { Location, Visit } from '@/api/types'

export const DEMO_LOCATION_ID = '11111111-1111-1111-1111-111111111111'

export const demoLocations: Location[] = [
  {
    id: DEMO_LOCATION_ID,
    companyName: 'EXPLORE Hamburg',
    street: 'Hafenstraße 1',
    postalCode: '20095',
    city: 'Hamburg',
    country: 'Germany',
    additionalInfo: 'Reception is on the ground floor — please check in at the terminal.',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    companyName: 'EXPLORE Berlin',
    street: 'Chausseestraße 12',
    postalCode: '10115',
    city: 'Berlin',
    country: 'Germany',
    additionalInfo: null,
  },
]

const stamp = '2026-09-11T08:00:00Z'

export const demoVisits: Visit[] = [
  {
    id: 'aaaaaaa1-0000-4000-8000-000000000001',
    visitorName: 'Grace Hopper',
    visitorCompany: 'Navy',
    visitDate: '2026-09-11',
    purpose: 'Systemaudit',
    hostName: 'Luca Gorsleben',
    contactInfo: 'grace@example.test',
    status: 'CHECKED_IN',
    locationId: DEMO_LOCATION_ID,
    locationName: 'EXPLORE Hamburg',
    checkedOutAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  },
  {
    id: 'aaaaaaa1-0000-4000-8000-000000000002',
    visitorName: 'Alan Turing',
    visitorCompany: 'NPL',
    visitDate: '2026-09-11',
    purpose: 'Workshop Kryptografie',
    hostName: 'Maike Brandt',
    contactInfo: '+49 40 123456',
    status: 'CHECKED_IN',
    locationId: DEMO_LOCATION_ID,
    locationName: 'EXPLORE Hamburg',
    checkedOutAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  },
  {
    id: 'aaaaaaa1-0000-4000-8000-000000000003',
    visitorName: 'Ada Lovelace',
    visitorCompany: null,
    visitDate: '2026-09-12',
    purpose: 'Vertragsgespräch',
    hostName: 'Jan Petersen',
    contactInfo: 'ada@example.test',
    status: 'REGISTERED',
    locationId: '22222222-2222-2222-2222-222222222222',
    locationName: 'EXPLORE Berlin',
    checkedOutAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  },
  {
    id: 'aaaaaaa1-0000-4000-8000-000000000004',
    visitorName: 'Katherine Johnson',
    visitorCompany: 'NASA',
    visitDate: '2026-09-10',
    purpose: 'Projektreview',
    hostName: 'Luca Gorsleben',
    contactInfo: 'katherine@example.test',
    status: 'CHECKED_OUT',
    locationId: DEMO_LOCATION_ID,
    locationName: 'EXPLORE Hamburg',
    checkedOutAt: '2026-09-10T15:30:00Z',
    createdAt: stamp,
    updatedAt: stamp,
  },
]
