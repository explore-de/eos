import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { ChangeEvent, FormEvent } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useParams } from 'react-router'

import { useGetPublicLocationQuery, useSelfCheckInMutation } from '../../api/eosApi'
import { toContactInfo } from '../../api/toContactInfo'
import { visitTokenReceived } from '../../app/authSlice'
import { useAppDispatch } from '../../app/hooks'
import { ErrorAlert } from '../../components/ErrorAlert'
import './CheckInPage.css'

interface FormState {
  visitorName: string
  visitorCompany: string
  purpose: string
  hostName: string
  email: string
  phone: string
  privacyConsent: boolean
}

const emptyForm: FormState = {
  visitorName: '',
  visitorCompany: '',
  purpose: '',
  hostName: '',
  email: '',
  phone: '',
  privacyConsent: false,
}

export function CheckInPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { locationId = '' } = useParams()
  const [form, setForm] = useState(emptyForm)

  const location = useGetPublicLocationQuery({ locationId }, { skip: !locationId })
  const [selfCheckIn, checkIn] = useSelfCheckInMutation()

  const hostRequired = location.data?.hostRequired === true

  const complete = useMemo(
    () =>
      form.visitorName.trim() !== '' &&
      form.purpose.trim() !== '' &&
      (form.email.trim() !== '' || form.phone.trim() !== '') &&
      (!hostRequired || form.hostName.trim() !== '') &&
      form.privacyConsent,
    [form, hostRequired],
  )

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }, [])

  const submit = useCallback(async () => {
    const result = await selfCheckIn({
      selfCheckInRequest: {
        locationId,
        visitorName: form.visitorName.trim(),
        ...(form.visitorCompany.trim() && { visitorCompany: form.visitorCompany.trim() }),
        purpose: form.purpose.trim(),
        ...(form.hostName.trim() && { hostName: form.hostName.trim() }),
        contact: toContactInfo(form.email, form.phone),
        privacyConsent: true,
      },
    }).unwrap()

    dispatch(visitTokenReceived(result.visitToken))
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

  if (location.isLoading) {
    return (
      <div className="eos-checkin__spinner">
        <CircularProgress aria-label={t('common.loading')} />
      </div>
    )
  }

  if (checkIn.isSuccess && checkIn.data) {
    return (
      <div className="eos-checkin__done">
        <Alert severity="success">{t('visitor.checkIn.success')}</Alert>
        <Button
          component={RouterLink}
          to={`/visit/${checkIn.data.visit.id}`}
          variant="contained"
          size="large"
          fullWidth
        >
          {t('visitor.checkIn.openBadge')}
        </Button>
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
          required={hostRequired}
          fullWidth
          label={t('visit.field.hostName')}
          name="hostName"
          value={form.hostName}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          type="email"
          inputMode="email"
          autoComplete="email"
          label={t('visit.field.email')}
          helperText={t('visitor.checkIn.contactHint')}
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          label={t('visit.field.phone')}
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />
        <FormControlLabel
          className="eos-checkin__consent"
          control={
            <Checkbox name="privacyConsent" checked={form.privacyConsent} onChange={handleChange} />
          }
          label={
            <Typography variant="body2">
              {t('visitor.checkIn.privacyConsent')}
              {location.data?.privacyNoticeUrl ? (
                <>
                  {' '}
                  <Link href={location.data.privacyNoticeUrl} target="_blank" rel="noreferrer">
                    {t('visitor.checkIn.privacyNotice')}
                  </Link>
                </>
              ) : null}
            </Typography>
          }
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
