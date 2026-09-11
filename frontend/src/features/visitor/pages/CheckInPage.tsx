import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { ChangeEvent, FormEvent } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams } from 'react-router'

import { useGetPublicLocationQuery, useSelfCheckInMutation } from '@/api/publicApi'
import { visitSessionStarted } from '@/features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { ErrorAlert } from '@/components/ErrorAlert'
import './CheckInPage.css'

interface FormState {
  visitorName: string
  visitorCompany: string
  purpose: string
  hostName: string
  contactInfo: string
  privacyConsent: boolean
}

const emptyForm: FormState = {
  visitorName: '',
  visitorCompany: '',
  purpose: '',
  hostName: '',
  contactInfo: '',
  privacyConsent: false,
}

export function CheckInPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { locationId = '' } = useParams()
  const session = useAppSelector((state) => state.auth.visit)
  const [form, setForm] = useState(emptyForm)

  const location = useGetPublicLocationQuery(locationId, { skip: !locationId })
  const [selfCheckIn, checkIn] = useSelfCheckInMutation()

  const complete = useMemo(
    () =>
      form.visitorName.trim() !== '' &&
      form.purpose.trim() !== '' &&
      form.contactInfo.trim() !== '' &&
      form.privacyConsent,
    [form],
  )

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }, [])

  const submit = useCallback(async () => {
    const result = await selfCheckIn({
      locationId,
      visitorName: form.visitorName.trim(),
      visitorCompany: form.visitorCompany.trim() || null,
      purpose: form.purpose.trim(),
      hostName: form.hostName.trim() || null,
      contactInfo: form.contactInfo.trim(),
      privacyConsent: true,
    }).unwrap()

    dispatch(visitSessionStarted({ visitId: result.visit.id, visitToken: result.visitToken }))
  }, [dispatch, form, locationId, selfCheckIn])

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      void submit()
    },
    [submit],
  )

  const conflictKey = useMemo(() => {
    const status = checkIn.error && 'status' in checkIn.error ? checkIn.error.status : undefined
    if (status === 409) return 'visitor.checkIn.conflict'
    if (status === 429) return 'visitor.checkIn.rateLimited'
    return undefined
  }, [checkIn.error])

  if (session) {
    return <Navigate to={`/visit/${session.visitId}`} replace />
  }

  if (location.isLoading) {
    return (
      <div className="eos-checkin__spinner">
        <CircularProgress aria-label={t('common.loading')} />
      </div>
    )
  }

  return (
    <div className="eos-checkin">
      <div className="eos-checkin__intro">
        <Typography variant="h4" component="h2">
          {t('visitor.checkIn.heading')}
        </Typography>
        {location.data ? (
          <Typography className="eos-checkin__location">{location.data.companyName}</Typography>
        ) : null}
        <Typography variant="body2" color="text.secondary">
          {t('visitor.checkIn.intro')}
        </Typography>
      </div>

      {location.data?.additionalInfo ? (
        <Paper variant="outlined" className="eos-checkin__note">
          <Typography variant="body2">{location.data.additionalInfo}</Typography>
        </Paper>
      ) : null}

      {location.isError ? <ErrorAlert error={location.error} /> : null}
      {conflictKey ? <Alert severity="warning">{t(conflictKey)}</Alert> : null}
      {checkIn.isError && !conflictKey ? <ErrorAlert error={checkIn.error} /> : null}

      <form className="eos-checkin__form" onSubmit={handleSubmit}>
        <TextField
          required
          fullWidth
          autoComplete="name"
          label={t('visit.field.visitorName')}
          name="visitorName"
          value={form.visitorName}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          autoComplete="organization"
          label={t('visit.field.visitorCompany')}
          name="visitorCompany"
          value={form.visitorCompany}
          onChange={handleChange}
        />
        <TextField
          required
          fullWidth
          multiline
          minRows={2}
          label={t('visit.field.purpose')}
          name="purpose"
          value={form.purpose}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          label={t('visit.field.hostName')}
          name="hostName"
          value={form.hostName}
          onChange={handleChange}
        />
        <TextField
          required
          fullWidth
          name="contactInfo"
          label={t('visit.field.contactInfo')}
          helperText={t('visitor.checkIn.contactHint')}
          value={form.contactInfo}
          onChange={handleChange}
        />
        <FormControlLabel
          className="eos-checkin__consent"
          control={
            <Checkbox name="privacyConsent" checked={form.privacyConsent} onChange={handleChange} />
          }
          label={<Typography variant="body2">{t('visitor.checkIn.privacyConsent')}</Typography>}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          className="eos-checkin__submit"
          disabled={!complete || checkIn.isLoading}
        >
          {t('visitor.checkIn.submit')}
        </Button>
      </form>
    </div>
  )
}
