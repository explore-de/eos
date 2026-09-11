import { baseApi as api } from "./baseApi";
export const addTagTypes = [
  "Visitor Self-Service",
  "Visits",
  "Locations",
  "Identity",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getPublicLocation: build.query<
        GetPublicLocationApiResponse,
        GetPublicLocationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/public/locations/${queryArg.locationId}`,
        }),
        providesTags: ["Visitor Self-Service"],
      }),
      selfCheckIn: build.mutation<SelfCheckInApiResponse, SelfCheckInApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/public/visits`,
          method: "POST",
          body: queryArg.selfCheckInRequest,
        }),
        invalidatesTags: ["Visitor Self-Service"],
      }),
      getOwnVisit: build.query<GetOwnVisitApiResponse, GetOwnVisitApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/public/visits/${queryArg.visitId}`,
          headers: {
            "X-Visit-Token": queryArg["X-Visit-Token"],
          },
        }),
        providesTags: ["Visitor Self-Service"],
      }),
      selfCheckOut: build.mutation<SelfCheckOutApiResponse, SelfCheckOutApiArg>(
        {
          query: (queryArg) => ({
            url: `/api/v1/public/visits/${queryArg.visitId}/checkout`,
            method: "POST",
            headers: {
              "X-Visit-Token": queryArg["X-Visit-Token"],
            },
          }),
          invalidatesTags: ["Visitor Self-Service"],
        },
      ),
      listVisits: build.query<ListVisitsApiResponse, ListVisitsApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/visits`,
          params: {
            locationId: queryArg.locationId,
            status: queryArg.status,
            from: queryArg["from"],
            to: queryArg.to,
            q: queryArg.q,
            page: queryArg.page,
            size: queryArg.size,
            sort: queryArg.sort,
          },
        }),
        providesTags: ["Visits"],
      }),
      createVisit: build.mutation<CreateVisitApiResponse, CreateVisitApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/visits`,
          method: "POST",
          body: queryArg.visitCreateRequest,
        }),
        invalidatesTags: ["Visits"],
      }),
      getVisit: build.query<GetVisitApiResponse, GetVisitApiArg>({
        query: (queryArg) => ({ url: `/api/v1/visits/${queryArg.visitId}` }),
        providesTags: ["Visits"],
      }),
      updateVisit: build.mutation<UpdateVisitApiResponse, UpdateVisitApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/visits/${queryArg.visitId}`,
          method: "PATCH",
          body: queryArg.visitUpdateRequest,
          headers: {
            "If-Match": queryArg["If-Match"],
          },
        }),
        invalidatesTags: ["Visits"],
      }),
      deleteVisit: build.mutation<DeleteVisitApiResponse, DeleteVisitApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/visits/${queryArg.visitId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Visits"],
      }),
      checkInVisit: build.mutation<CheckInVisitApiResponse, CheckInVisitApiArg>(
        {
          query: (queryArg) => ({
            url: `/api/v1/visits/${queryArg.visitId}/checkin`,
            method: "POST",
          }),
          invalidatesTags: ["Visits"],
        },
      ),
      checkOutVisit: build.mutation<
        CheckOutVisitApiResponse,
        CheckOutVisitApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/visits/${queryArg.visitId}/checkout`,
          method: "POST",
        }),
        invalidatesTags: ["Visits"],
      }),
      getVisitorPass: build.query<
        GetVisitorPassApiResponse,
        GetVisitorPassApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/visits/${queryArg.visitId}/pass`,
        }),
        providesTags: ["Visits"],
      }),
      verifyVisitorPass: build.query<
        VerifyVisitorPassApiResponse,
        VerifyVisitorPassApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/visits/${queryArg.visitId}/pass/verify`,
          params: {
            token: queryArg.token,
          },
        }),
        providesTags: ["Visits"],
      }),
      listLocations: build.query<ListLocationsApiResponse, ListLocationsApiArg>(
        {
          query: (queryArg) => ({
            url: `/api/v1/locations`,
            params: {
              active: queryArg.active,
            },
          }),
          providesTags: ["Locations"],
        },
      ),
      createLocation: build.mutation<
        CreateLocationApiResponse,
        CreateLocationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/locations`,
          method: "POST",
          body: queryArg.locationRequest,
        }),
        invalidatesTags: ["Locations"],
      }),
      getLocation: build.query<GetLocationApiResponse, GetLocationApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/locations/${queryArg.locationId}`,
        }),
        providesTags: ["Locations"],
      }),
      replaceLocation: build.mutation<
        ReplaceLocationApiResponse,
        ReplaceLocationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/locations/${queryArg.locationId}`,
          method: "PUT",
          body: queryArg.locationRequest,
          headers: {
            "If-Match": queryArg["If-Match"],
          },
        }),
        invalidatesTags: ["Locations"],
      }),
      deleteLocation: build.mutation<
        DeleteLocationApiResponse,
        DeleteLocationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/locations/${queryArg.locationId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Locations"],
      }),
      getLocationQr: build.query<GetLocationQrApiResponse, GetLocationQrApiArg>(
        {
          query: (queryArg) => ({
            url: `/api/v1/locations/${queryArg.locationId}/qr.png`,
            params: {
              size: queryArg.size,
            },
          }),
          providesTags: ["Locations"],
        },
      ),
      getCurrentUser: build.query<
        GetCurrentUserApiResponse,
        GetCurrentUserApiArg
      >({
        query: () => ({ url: `/api/v1/me` }),
        providesTags: ["Identity"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as eosApi };
export type GetPublicLocationApiResponse =
  /** status 200 Location found */ PublicLocation;
export type GetPublicLocationApiArg = {
  locationId: string;
};
export type SelfCheckInApiResponse =
  /** status 201 Visit created */ VisitCredential;
export type SelfCheckInApiArg = {
  selfCheckInRequest: SelfCheckInRequest;
};
export type GetOwnVisitApiResponse = /** status 200 Badge data */ VisitBadge;
export type GetOwnVisitApiArg = {
  visitId: string;
  /** Opaque token returned by `selfCheckIn`. */
  "X-Visit-Token": string;
};
export type SelfCheckOutApiResponse =
  /** status 200 Visit checked out */ VisitBadge;
export type SelfCheckOutApiArg = {
  visitId: string;
  /** Opaque token returned by `selfCheckIn`. */
  "X-Visit-Token": string;
};
export type ListVisitsApiResponse = /** status 200 Page of visits */ VisitPage;
export type ListVisitsApiArg = {
  locationId?: string;
  status?: VisitStatus[];
  /** Inclusive lower bound on `visitDate`. */
  from?: string;
  /** Inclusive upper bound on `visitDate`. */
  to?: string;
  /** Free text over visitor name, company, host and `contact.text`. */
  q?: string;
  page?: number;
  size?: number;
  sort?:
    | "checkInAt"
    | "-checkInAt"
    | "visitDate"
    | "-visitDate"
    | "visitorName"
    | "-visitorName";
};
export type CreateVisitApiResponse = /** status 201 Visit created */ Visit;
export type CreateVisitApiArg = {
  visitCreateRequest: VisitCreateRequest;
};
export type GetVisitApiResponse = /** status 200 Visit */ Visit;
export type GetVisitApiArg = {
  visitId: string;
};
export type UpdateVisitApiResponse = /** status 200 Updated visit */ Visit;
export type UpdateVisitApiArg = {
  visitId: string;
  /** ETag of the version being modified, for optimistic locking. */
  "If-Match": string;
  visitUpdateRequest: VisitUpdateRequest;
};
export type DeleteVisitApiResponse = unknown;
export type DeleteVisitApiArg = {
  visitId: string;
};
export type CheckInVisitApiResponse = /** status 200 Visit checked in */ Visit;
export type CheckInVisitApiArg = {
  visitId: string;
};
export type CheckOutVisitApiResponse =
  /** status 200 Visit checked out */ Visit;
export type CheckOutVisitApiArg = {
  visitId: string;
};
export type GetVisitorPassApiResponse = /** status 200 PDF pass */ Blob;
export type GetVisitorPassApiArg = {
  visitId: string;
};
export type VerifyVisitorPassApiResponse =
  /** status 200 Valid pass and current visit state */ PassVerification;
export type VerifyVisitorPassApiArg = {
  visitId: string;
  token: string;
};
export type ListLocationsApiResponse =
  /** status 200 Locations */ LocationRead[];
export type ListLocationsApiArg = {
  active?: boolean;
};
export type CreateLocationApiResponse =
  /** status 201 Location created */ LocationRead;
export type CreateLocationApiArg = {
  locationRequest: LocationRequest;
};
export type GetLocationApiResponse = /** status 200 Location */ LocationRead;
export type GetLocationApiArg = {
  locationId: string;
};
export type ReplaceLocationApiResponse =
  /** status 200 Updated location */ LocationRead;
export type ReplaceLocationApiArg = {
  locationId: string;
  /** ETag of the version being modified, for optimistic locking. */
  "If-Match": string;
  locationRequest: LocationRequest;
};
export type DeleteLocationApiResponse = unknown;
export type DeleteLocationApiArg = {
  locationId: string;
};
export type GetLocationQrApiResponse = /** status 200 PNG QR code */ Blob;
export type GetLocationQrApiArg = {
  locationId: string;
  size?: number;
};
export type GetCurrentUserApiResponse = /** status 200 Identity */ CurrentUser;
export type GetCurrentUserApiArg = void;
export type Address = {
  street: string;
  postalCode: string;
  city: string;
  /** ISO 3166-1 alpha-2. */
  country?: string;
};
export type PublicLocation = {
  id: string;
  companyName: string;
  address: Address;
  /** Free text shown on the registration form (Zusatz Info). */
  additionalInfo?: string;
  hostRequired?: boolean;
  privacyNoticeUrl?: string;
};
export type Problem = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  /** Field-level validation failures. */
  errors?: {
    field: string;
    message: string;
  }[];
};
export type VisitStatus = "EXPECTED" | "ON_SITE" | "CHECKED_OUT";
export type VisitBadge = {
  id: string;
  visitorName: string;
  visitorCompany?: string;
  visitDate: string;
  purpose?: string;
  hostName?: string;
  status: VisitStatus;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  location: PublicLocation;
};
export type VisitCredential = {
  visit: VisitBadge;
  /** Returned only here. Sent back as `X-Visit-Token`. */
  visitToken: string;
  badgeUrl: string;
};
export type ContactInfo = {
  text: string;
  email?: string;
};
export type SelfCheckInRequest = {
  locationId: string;
  visitorName: string;
  visitorCompany?: string;
  purpose: string;
  hostName?: string;
  contact: ContactInfo;
  /** Must be true — GDPR consent for storing the contact data. */
  privacyConsent: true;
};
export type Visit = {
  id: string;
  locationId: string;
  visitorName: string;
  visitorCompany?: string;
  /** Day the visit is registered for (Datum). */
  visitDate: string;
  /** Reason for the visit (Anlass). */
  purpose: string;
  /** Employee being visited. */
  hostName?: string;
  contact: ContactInfo;
  status: VisitStatus;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  selfRegistered?: boolean;
  createdAt: string;
  /** Admin subject that created the visit; null for self-registration. */
  createdBy?: string | null;
  updatedAt?: string;
};
export type VisitPage = {
  items: Visit[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
export type VisitCreateRequest = {
  locationId: string;
  visitorName: string;
  visitorCompany?: string;
  visitDate: string;
  purpose: string;
  hostName?: string;
  contact: ContactInfo;
};
export type VisitUpdateRequest = {
  visitorName?: string;
  visitorCompany?: string | null;
  visitDate?: string;
  purpose?: string;
  hostName?: string | null;
  contact?: ContactInfo;
};
export type PassVerification = {
  valid: true;
  visitId: string;
  visitorName: string;
  visitDate: string;
  status: VisitStatus;
  locationName: string;
};
export type Location = PublicLocation & {
  active: boolean;
  /** Days a checked-out visit is kept before purge. */
  retentionDays?: number;
  createdAt: string;
  updatedAt?: string;
};
export type LocationRead = PublicLocation & {
  active: boolean;
  /** Days a checked-out visit is kept before purge. */
  retentionDays?: number;
  onSiteCount?: number;
  createdAt: string;
  updatedAt?: string;
};
export type LocationRequest = {
  companyName: string;
  address: Address;
  additionalInfo?: string;
  hostRequired?: boolean;
  privacyNoticeUrl?: string;
  active?: boolean;
  retentionDays?: number;
};
export type CurrentUser = {
  subject: string;
  name?: string;
  email?: string;
  roles: string[];
  /** Locations this admin may manage; empty means all. */
  locationIds?: string[];
};
export const {
  useGetPublicLocationQuery,
  useLazyGetPublicLocationQuery,
  useSelfCheckInMutation,
  useGetOwnVisitQuery,
  useLazyGetOwnVisitQuery,
  useSelfCheckOutMutation,
  useListVisitsQuery,
  useLazyListVisitsQuery,
  useCreateVisitMutation,
  useGetVisitQuery,
  useLazyGetVisitQuery,
  useUpdateVisitMutation,
  useDeleteVisitMutation,
  useCheckInVisitMutation,
  useCheckOutVisitMutation,
  useGetVisitorPassQuery,
  useLazyGetVisitorPassQuery,
  useVerifyVisitorPassQuery,
  useLazyVerifyVisitorPassQuery,
  useListLocationsQuery,
  useLazyListLocationsQuery,
  useCreateLocationMutation,
  useGetLocationQuery,
  useLazyGetLocationQuery,
  useReplaceLocationMutation,
  useDeleteLocationMutation,
  useGetLocationQrQuery,
  useLazyGetLocationQrQuery,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
} = injectedRtkApi;
