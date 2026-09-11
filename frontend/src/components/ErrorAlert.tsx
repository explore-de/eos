import Alert from '@mui/material/Alert'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { SerializedError } from '@reduxjs/toolkit'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { Problem } from '../api/eosApi'

type ApiError = FetchBaseQueryError | SerializedError | undefined

const statusKey: Record<number, 'error.unauthorized' | 'error.forbidden' | 'error.notFound'> = {
  401: 'error.unauthorized',
  403: 'error.forbidden',
  404: 'error.notFound',
}

function problemDetail(error: ApiError): string | undefined {
  if (!error || !('status' in error)) return undefined
  const body = error.data as Problem | undefined
  return body?.detail ?? body?.title
}

export function ErrorAlert({ error }: { error: ApiError }) {
  const { t } = useTranslation()

  const message = useMemo(() => {
    if (!error) return undefined
    const status = 'status' in error && typeof error.status === 'number' ? error.status : undefined
    const key = status ? statusKey[status] : undefined
    return problemDetail(error) ?? (key ? t(key) : t('error.generic'))
  }, [error, t])

  if (!message) return null

  return <Alert severity="error">{message}</Alert>
}
