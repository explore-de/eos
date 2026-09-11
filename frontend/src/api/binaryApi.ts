import { baseApi } from './baseApi'

export const binaryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    locationQrPng: build.query<Blob, { locationId: string; size?: number }>({
      query: ({ locationId, size = 512 }) => ({
        url: `/api/v1/locations/${locationId}/qr.png`,
        params: { size },
        responseHandler: (response) => response.blob(),
      }),
    }),
    visitorPassPdf: build.query<Blob, { visitId: string }>({
      query: ({ visitId }) => ({
        url: `/api/v1/visits/${visitId}/pass`,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
})

export const { useLocationQrPngQuery, useLazyVisitorPassPdfQuery } = binaryApi
