export type VisitStatus = 'REGISTERED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED'

export interface Location {
  id: string
  companyName: string
  street: string
  postalCode: string
  city: string
  country: string
  additionalInfo?: string | null
}

export interface LocationRequest {
  companyName: string
  street: string
  postalCode: string
  city: string
  country: string
  additionalInfo?: string | null
}

export interface Visit {
  id: string
  visitorName: string
  visitorCompany?: string | null
  visitDate: string
  purpose: string
  hostName: string
  contactInfo?: string | null
  status: VisitStatus
  locationId: string
  locationName: string
  checkedOutAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface VisitRequest {
  visitorName: string
  visitorCompany?: string | null
  visitDate: string
  purpose: string
  hostName: string
  contactInfo?: string | null
  status?: VisitStatus
  locationId: string
}

export interface VisitQuery {
  date?: string
  status?: VisitStatus
  locationId?: string
  limit?: number
  offset?: number
}
