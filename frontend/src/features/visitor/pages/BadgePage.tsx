import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { useGetOwnVisitQuery, useSelfCheckOutMutation } from '@/api/publicApi'
import { visitSessionEnded } from '@/features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { ErrorAlert } from '@/components/ErrorAlert'
import { StatusChip } from '@/components/StatusChip'
import { BadgeField } from '@/features/visitor/components/BadgeField'
import './BadgePage.css'

export function BadgePage() {
  const { t } = useTranslation()
  const { visitId = '' } = useParams()
  const dispatch = useAppDispatch()
  const session = useAppSelector((state) => state.auth.visit)
  const visitToken = session?.visitToken

  const visit = useGetOwnVisitQuery(
    { visitId, visitToken: visitToken ?? '' },
    { skip: !visitId || !visitToken },
  )
  const [selfCheckOut, checkOut] = useSelfCheckOutMutation()

  const checkOutVisit = useCallback(async () => {
    if (!visitToken) return
    await selfCheckOut({ visitId, visitToken }).unwrap()
    dispatch(visitSessionEnded())
  }, [dispatch, selfCheckOut, visitId, visitToken])

  const handleCheckOut = useCallback(() => void checkOutVisit(), [checkOutVisit])

  const badgeStatus =
    visit.error && 'status' in visit.error && typeof visit.error.status === 'number'
      ? visit.error.status
      : undefined

  useEffect(() => {
    if (badgeStatus === 401 || badgeStatus === 404 || badgeStatus === 410) {
      dispatch(visitSessionEnded())
    }
  }, [badgeStatus, dispatch])

  if (checkOut.isSuccess) {
    return (
      <div className="eos-badge">
        <Alert severity="success">{t('visitor.badge.checkedOut')}</Alert>
      </div>
    )
  }

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
          <BadgeField label={t('visit.field.location')} value={badge.locationName} />
          <BadgeField label={t('visit.field.visitDate')} value={badge.visitDate} />
          <BadgeField label={t('visit.field.hostName')} value={badge.hostName} />
          <BadgeField label={t('visit.field.purpose')} value={badge.purpose} />
        </div>

        <Typography variant="caption" color="text.secondary" className="eos-badge__hint">
          {t('visitor.badge.showAtReception')}
        </Typography>
      </Paper>

      {checkOut.isError ? <ErrorAlert error={checkOut.error} /> : null}

      {badge.status === 'CHECKED_OUT' || badge.status === 'CANCELLED' ? (
        <Alert severity="success">{t('visitor.badge.checkedOut')}</Alert>
      ) : (
        <Button
          variant="contained"
          size="large"
          fullWidth
          className="eos-badge__action"
          disabled={checkOut.isLoading}
          onClick={handleCheckOut}
        >
          {t('visitor.badge.checkOut')}
        </Button>
      )}
    </div>
  )
}
