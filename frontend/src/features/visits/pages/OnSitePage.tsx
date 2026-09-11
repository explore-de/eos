import PrintIcon from '@mui/icons-material/Print'
import RefreshIcon from '@mui/icons-material/Refresh'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useListVisitsQuery } from '@/api/eosApi'
import { ErrorAlert } from '@/components/ErrorAlert'
import { PageHeader } from '@/components/PageHeader'
import { VisitList } from '@/features/visits/components/VisitList'
import './OnSitePage.css'

const noop = () => undefined

export function OnSitePage() {
  const { t } = useTranslation()
  const { data, error, isError, isLoading, isFetching, refetch } = useListVisitsQuery({
    status: ['ON_SITE'],
  })

  const visits = useMemo(() => data?.items ?? [], [data])

  const refresh = useCallback(() => void refetch(), [refetch])

  const print = useCallback(() => window.print(), [])

  return (
    <div className="eos-onsite">
      <PageHeader
        title={t('admin.onSite.heading')}
        subtitle={t('admin.onSite.subtitle')}
        action={
          <>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              className="eos-no-print"
              disabled={isFetching}
              onClick={refresh}
            >
              {t('common.refresh')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              className="eos-no-print"
              onClick={print}
            >
              {t('common.print')}
            </Button>
          </>
        }
      />

      {isError ? <ErrorAlert error={error} /> : null}

      {isLoading ? (
        <div className="eos-onsite__spinner">
          <CircularProgress aria-label={t('common.loading')} />
        </div>
      ) : visits.length === 0 ? (
        <Typography color="text.secondary" className="eos-onsite__empty">
          {t('admin.onSite.empty')}
        </Typography>
      ) : (
        <>
          <Typography variant="subtitle2" className="eos-onsite__count">
            {t('admin.onSite.count', { count: visits.length })}
          </Typography>
          <VisitList visits={visits} onEdit={noop} onDelete={noop} />
        </>
      )}
    </div>
  )
}
