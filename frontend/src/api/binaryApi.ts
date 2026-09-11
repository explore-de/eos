import { baseApi } from './baseApi'

export const binaryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    visitorPassPdf: build.query<Blob, string>({
      query: (visitId) => ({
        url: `/api/v1/visits/${visitId}/pass`,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
})

export const { useLazyVisitorPassPdfQuery } = binaryApi
