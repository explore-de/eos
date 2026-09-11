import { useEffect } from 'react'
import { useAuth } from 'react-oidc-context'

import { baseApi } from '@/api/baseApi'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { accessTokenReceived } from './authSlice'

export function useAdminToken() {
  const auth = useAuth()
  const dispatch = useAppDispatch()
  const accessToken = auth.user?.access_token ?? null
  const storedToken = useAppSelector((state) => state.auth.accessToken)

  useEffect(() => {
    if (storedToken === accessToken) return
    dispatch(accessTokenReceived(accessToken))
    dispatch(baseApi.util.resetApiState())
  }, [accessToken, dispatch, storedToken])

  return { auth, tokenReady: accessToken !== null && storedToken === accessToken }
}
