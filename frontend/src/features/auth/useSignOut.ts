import { useNavigate } from 'react-router'

import { baseApi } from '@/api/baseApi'
import { signedOut } from './authSlice'
import { useAppDispatch } from '@/app/hooks'

export function useSignOut() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return () => {
    dispatch(signedOut())
    dispatch(baseApi.util.resetApiState())
    void navigate('/admin/logout', { replace: true })
  }
}
