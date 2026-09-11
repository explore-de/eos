import { baseApi } from './baseApi'
import type { Location, Visit } from './types'

const PUBLIC = '/api/v1/public'

export interface SelfCheckInRequest {
  locationId: string
  visitorName: string
  visitorCompany?: string | null
  purpose: string
  hostName?: string | null
  contactInfo: string
  privacyConsent: true
}

export interface VisitCredential {
  visit: Visit
  visitToken: string
}

export const publicApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicLocation: build.query<Location, string>({
      query: (locationId) => ({ url: `${PUBLIC}/locations/${locationId}` }),
      providesTags: ['Location'],
    }),
    selfCheckIn: build.mutation<VisitCredential, SelfCheckInRequest>({
      query: (body) => ({ url: `${PUBLIC}/visits`, method: 'POST', body }),
      invalidatesTags: ['Visit'],
    }),
    getOwnVisit: build.query<Visit, { visitId: string; visitToken: string }>({
      query: ({ visitId, visitToken }) => ({
        url: `${PUBLIC}/visits/${visitId}`,
        headers: { 'X-Visit-Token': visitToken },
      }),
      providesTags: ['Visit'],
    }),
    selfCheckOut: build.mutation<Visit, { visitId: string; visitToken: string }>({
      query: ({ visitId, visitToken }) => ({
        url: `${PUBLIC}/visits/${visitId}/checkout`,
        method: 'POST',
        headers: { 'X-Visit-Token': visitToken },
      }),
      invalidatesTags: ['Visit'],
    }),
  }),
})

export const {
  useGetPublicLocationQuery,
  useSelfCheckInMutation,
  useGetOwnVisitQuery,
  useSelfCheckOutMutation,
} = publicApi
