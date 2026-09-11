import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { ErrorAlert } from '@/components/ErrorAlert'
import './RequireAdmin.css'
import { useAdminToken } from './useAdminToken'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const auth = useAdminToken()

  const signIn = useCallback(() => void auth.signinRedirect(), [auth])

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated && !auth.activeNavigator && !auth.error) {
      void auth.signinRedirect()
    }
  }, [auth])

  if (auth.isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="eos-signin">
      <Paper variant="outlined" className="eos-signin__card">
        <Typography variant="h5" component="h1">
          {t('admin.signIn.heading')}
        </Typography>
        {auth.error ? (
          <ErrorAlert error={{ status: 'CUSTOM_ERROR', error: auth.error.message, data: null }} />
        ) : (
          <Typography color="text.secondary">{t('admin.signIn.body')}</Typography>
        )}
        {auth.isLoading || auth.activeNavigator ? (
          <CircularProgress aria-label={t('common.loading')} />
        ) : (
          <Button variant="contained" size="large" onClick={signIn}>
            {t('admin.signIn.action')}
          </Button>
        )}
      </Paper>
    </div>
  )
}
