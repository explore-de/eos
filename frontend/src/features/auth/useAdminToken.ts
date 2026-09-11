import { useEffect } from 'react'
import { useAuth } from 'react-oidc-context'

import { accessTokenReceived } from './authSlice'
import { useAppDispatch } from '@/app/hooks'

export function useAdminToken() {
  const auth = useAuth()
  const dispatch = useAppDispatch()
  const accessToken = auth.user?.access_token ?? null

  useEffect(() => {
    dispatch(accessTokenReceived(accessToken))
  }, [accessToken, dispatch])

  return auth
}
