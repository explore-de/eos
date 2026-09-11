import { baseApi } from './baseApi'
import type { Location, LocationRequest, Visit, VisitQuery, VisitRequest } from './types'

const ADMIN = '/api/v1/admin'

export const eosApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listVisits: build.query<Visit[], VisitQuery>({
      query: (params) => ({ url: `${ADMIN}/visits`, params }),
      providesTags: ['Visit'],
    }),
    getVisit: build.query<Visit, string>({
      query: (visitId) => ({ url: `${ADMIN}/visits/${visitId}` }),
      providesTags: ['Visit'],
    }),
    createVisit: build.mutation<Visit, VisitRequest>({
      query: (body) => ({ url: `${ADMIN}/visits`, method: 'POST', body }),
      invalidatesTags: ['Visit', 'Location'],
    }),
    updateVisit: build.mutation<Visit, { visitId: string; body: VisitRequest }>({
      query: ({ visitId, body }) => ({ url: `${ADMIN}/visits/${visitId}`, method: 'PUT', body }),
      invalidatesTags: ['Visit'],
    }),
    checkOutVisit: build.mutation<Visit, string>({
      query: (visitId) => ({ url: `${ADMIN}/visits/${visitId}/check-out`, method: 'POST' }),
      invalidatesTags: ['Visit'],
    }),
    deleteVisit: build.mutation<void, string>({
      query: (visitId) => ({ url: `${ADMIN}/visits/${visitId}`, method: 'DELETE' }),
      invalidatesTags: ['Visit', 'Location'],
    }),

    listLocations: build.query<Location[], void>({
      query: () => ({ url: `${ADMIN}/locations` }),
      providesTags: ['Location'],
    }),
    createLocation: build.mutation<Location, LocationRequest>({
      query: (body) => ({ url: `${ADMIN}/locations`, method: 'POST', body }),
      invalidatesTags: ['Location'],
    }),
    replaceLocation: build.mutation<Location, { locationId: string; body: LocationRequest }>({
      query: ({ locationId, body }) => ({
        url: `${ADMIN}/locations/${locationId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Location'],
    }),
    deleteLocation: build.mutation<void, string>({
      query: (locationId) => ({ url: `${ADMIN}/locations/${locationId}`, method: 'DELETE' }),
      invalidatesTags: ['Location'],
    }),
  }),
})

export const {
  useListVisitsQuery,
  useGetVisitQuery,
  useCreateVisitMutation,
  useUpdateVisitMutation,
  useCheckOutVisitMutation,
  useDeleteVisitMutation,
  useListLocationsQuery,
  useCreateLocationMutation,
  useReplaceLocationMutation,
  useDeleteLocationMutation,
} = eosApi
