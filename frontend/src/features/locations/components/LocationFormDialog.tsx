import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import type { ChangeEvent } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { LocationRead } from '@/api/eosApi'
import { useCreateLocationMutation, useReplaceLocationMutation } from '@/api/eosApi'
import { ErrorAlert } from '@/components/ErrorAlert'
import '@/styles/form-dialog.css'

interface Props {
  open: boolean
  location?: LocationRead
  onClose: () => void
}

interface FormState {
  companyName: string
  street: string
  postalCode: string
  city: string
  country: string
  additionalInfo: string
  privacyNoticeUrl: string
  retentionDays: string
  hostRequired: boolean
  active: boolean
}

const toForm = (location?: LocationRead): FormState => ({
  companyName: location?.companyName ?? '',
  street: location?.address.street ?? '',
  postalCode: location?.address.postalCode ?? '',
  city: location?.address.city ?? '',
  country: location?.address.country ?? 'DE',
  additionalInfo: location?.additionalInfo ?? '',
  privacyNoticeUrl: location?.privacyNoticeUrl ?? '',
  retentionDays: String(location?.retentionDays ?? 90),
  hostRequired: location?.hostRequired ?? false,
  active: location?.active ?? true,
})

export function LocationFormDialog({ open, location, onClose }: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [form, setForm] = useState(() => toForm(location))

  const [createLocation, create] = useCreateLocationMutation()
  const [replaceLocation, replace] = useReplaceLocationMutation()

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }, [])

  const complete = useMemo(
    () =>
      form.companyName.trim() !== '' &&
      form.street.trim() !== '' &&
      form.postalCode.trim() !== '' &&
      form.city.trim() !== '',
    [form],
  )

  const submit = useCallback(async () => {
    const locationRequest = {
      companyName: form.companyName.trim(),
      address: {
        street: form.street.trim(),
        postalCode: form.postalCode.trim(),
        city: form.city.trim(),
        ...(form.country.trim() && { country: form.country.trim().toUpperCase() }),
      },
      ...(form.additionalInfo.trim() && { additionalInfo: form.additionalInfo.trim() }),
      ...(form.privacyNoticeUrl.trim() && { privacyNoticeUrl: form.privacyNoticeUrl.trim() }),
      hostRequired: form.hostRequired,
      active: form.active,
      retentionDays: Number(form.retentionDays) || 90,
    }

    if (location) {
      await replaceLocation({
        locationId: location.id,
        'If-Match': '*',
        locationRequest,
      }).unwrap()
    } else {
      await createLocation({ locationRequest }).unwrap()
    }
    onClose()
  }, [createLocation, form, location, onClose, replaceLocation])

  const handleSubmit = useCallback(() => void submit(), [submit])

  const pending = create.isLoading || replace.isLoading

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      className="eos-form-dialog"
    >
      <DialogTitle>
        {t(location ? 'admin.locations.editHeading' : 'admin.locations.createHeading')}
      </DialogTitle>
      <DialogContent>
        <div className="eos-form-dialog__content">
          {create.isError ? <ErrorAlert error={create.error} /> : null}
          {replace.isError ? <ErrorAlert error={replace.error} /> : null}
          <TextField
            required
            fullWidth
            label={t('admin.locations.field.companyName')}
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
          />
          <TextField
            required
            fullWidth
            label={t('admin.locations.field.street')}
            name="street"
            value={form.street}
            onChange={handleChange}
          />
          <div className="eos-form-dialog__row">
            <TextField
              required
              className="eos-form-dialog__field--postal"
              label={t('admin.locations.field.postalCode')}
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
            />
            <TextField
              required
              fullWidth
              label={t('admin.locations.field.city')}
              name="city"
              value={form.city}
              onChange={handleChange}
            />
            <TextField
              className="eos-form-dialog__field--country"
              label={t('admin.locations.field.country')}
              name="country"
              value={form.country}
              onChange={handleChange}
              slotProps={{ htmlInput: { maxLength: 2 } }}
            />
          </div>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label={t('admin.locations.field.additionalInfo')}
            name="additionalInfo"
            value={form.additionalInfo}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            type="url"
            label={t('admin.locations.field.privacyNoticeUrl')}
            name="privacyNoticeUrl"
            value={form.privacyNoticeUrl}
            onChange={handleChange}
          />
          <TextField
            type="number"
            className="eos-form-dialog__field--narrow"
            label={t('admin.locations.field.retentionDays')}
            name="retentionDays"
            value={form.retentionDays}
            onChange={handleChange}
            slotProps={{ htmlInput: { min: 1, max: 3650 } }}
          />
          <FormControlLabel
            control={
              <Switch name="hostRequired" checked={form.hostRequired} onChange={handleChange} />
            }
            label={t('admin.locations.field.hostRequired')}
          />
          <FormControlLabel
            control={<Switch name="active" checked={form.active} onChange={handleChange} />}
            label={t('admin.locations.field.active')}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="contained" disabled={!complete || pending} onClick={handleSubmit}>
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
