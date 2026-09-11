import { useCallback } from 'react'
import { useAuth } from 'react-oidc-context'

import { baseApi } from '@/api/baseApi'
import { useAppDispatch } from '@/app/hooks'
import { signedOut } from './authSlice'

export function useSignOut() {
  const dispatch = useAppDispatch()
  const auth = useAuth()

  return useCallback(() => {
    dispatch(signedOut())
    dispatch(baseApi.util.resetApiState())
    void auth.signoutRedirect()
  }, [auth, dispatch])
}
