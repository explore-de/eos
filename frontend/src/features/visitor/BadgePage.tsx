import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { useGetOwnVisitQuery, useSelfCheckOutMutation } from '../../api/eosApi'
import { useAppSelector } from '../../app/hooks'
import { ErrorAlert } from '../../components/ErrorAlert'
import { StatusChip } from '../../components/StatusChip'
import { BadgeField } from './BadgeField'
import './BadgePage.css'

export function BadgePage() {
  const { t } = useTranslation()
  const { visitId = '' } = useParams()
  const visitToken = useAppSelector((state) => state.auth.visitToken)

  const visit = useGetOwnVisitQuery(
    { visitId, 'X-Visit-Token': visitToken ?? '' },
    { skip: !visitId || !visitToken },
  )
  const [selfCheckOut, checkOut] = useSelfCheckOutMutation()

  const checkOutVisit = useCallback(() => {
    if (!visitToken) return
    void selfCheckOut({ visitId, 'X-Visit-Token': visitToken })
  }, [selfCheckOut, visitId, visitToken])

  if (!visitToken) {
    return <Alert severity="warning">{t('visitor.badge.missingToken')}</Alert>
  }

  if (visit.isLoading) {
    return (
      <div className="eos-badge__spinner">
        <CircularProgress aria-label={t('common.loading')} />
      </div>
    )
  }

  if (visit.isError || !visit.data) {
    return <ErrorAlert error={visit.error} />
  }

  const badge = visit.data
  const address = badge.location.address

  return (
    <div className="eos-badge">
      <Paper variant="outlined" className="eos-badge__card">
        <div className="eos-badge__top">
          <Typography variant="overline" color="text.secondary">
            {t('visitor.badge.heading')}
          </Typography>
          <StatusChip status={badge.status} />
        </div>

        <Typography variant="h4" component="h2" className="eos-badge__name">
          {badge.visitorName}
        </Typography>
        {badge.visitorCompany ? (
          <Typography color="text.secondary">{badge.visitorCompany}</Typography>
        ) : null}

        <Divider />

        <div className="eos-badge__fields">
          <BadgeField label={t('visit.field.location')} value={badge.location.companyName} />
          <BadgeField
            label={t('visit.field.visitDate')}
            value={`${badge.visitDate}${address ? ` · ${address.city}` : ''}`}
          />
          <BadgeField label={t('visit.field.hostName')} value={badge.hostName} />
          <BadgeField label={t('visit.field.purpose')} value={badge.purpose} />
        </div>

        <Typography variant="caption" color="text.secondary" className="eos-badge__hint">
          {t('visitor.badge.showAtReception')}
        </Typography>
      </Paper>

      {checkOut.isError ? <ErrorAlert error={checkOut.error} /> : null}

      {badge.status === 'CHECKED_OUT' ? (
        <Alert severity="success">{t('visitor.badge.checkedOut')}</Alert>
      ) : (
        <Button
          variant="contained"
          size="large"
          fullWidth
          className="eos-badge__action"
          disabled={checkOut.isLoading}
          onClick={checkOutVisit}
        >
          {t('visitor.badge.checkOut')}
        </Button>
      )}
    </div>
  )
}
