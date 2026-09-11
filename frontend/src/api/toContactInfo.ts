import type { ContactInfo } from './eosApi'

export function toContactInfo(email: string, phone: string): ContactInfo {
  const trimmedEmail = email.trim()
  const trimmedPhone = phone.trim()

  return trimmedEmail ? { text: trimmedEmail, email: trimmedEmail } : { text: trimmedPhone }
}
