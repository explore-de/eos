import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import type { RootState } from '../app/store'

export const baseApi = createApi({
  reducerPath: 'eosApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/',
    prepareHeaders: (headers, { getState }) => {
      const { accessToken, visitToken } = (getState() as RootState).auth
      if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
      if (visitToken) headers.set('X-Visit-Token', visitToken)
      return headers
    },
  }),
  tagTypes: ['Visit', 'Location', 'Identity'],
  endpoints: () => ({}),
})
