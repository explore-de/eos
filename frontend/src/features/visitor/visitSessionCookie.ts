export interface VisitSession {
  visitId: string
  visitToken: string
}

const COOKIE_NAME = 'eos_visit'
const MAX_AGE_SECONDS = 16 * 60 * 60

export function readVisitSession(): VisitSession | null {
  const entry = document.cookie
    .split('; ')
    .find((candidate) => candidate.startsWith(`${COOKIE_NAME}=`))

  if (!entry) return null

  const [visitId, visitToken] = decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)).split('|')
  return visitId && visitToken ? { visitId, visitToken } : null
}

export function writeVisitSession(session: VisitSession) {
  const value = encodeURIComponent(`${session.visitId}|${session.visitToken}`)
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`
}

export function clearVisitSession() {
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`
}
