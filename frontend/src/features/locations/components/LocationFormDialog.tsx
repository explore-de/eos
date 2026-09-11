import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import type { ChangeEvent } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCreateLocationMutation, useReplaceLocationMutation } from '@/api/eosApi'
import type { Location } from '@/api/types'
import { ErrorAlert } from '@/components/ErrorAlert'
import '@/styles/form-dialog.css'

interface Props {
  open: boolean
  location?: Location
  onClose: () => void
}

interface FormState {
  companyName: string
  street: string
  postalCode: string
  city: string
  country: string
  additionalInfo: string
}

const toForm = (location?: Location): FormState => ({
  companyName: location?.companyName ?? '',
  street: location?.street ?? '',
  postalCode: location?.postalCode ?? '',
  city: location?.city ?? '',
  country: location?.country ?? 'Germany',
  additionalInfo: location?.additionalInfo ?? '',
})

export function LocationFormDialog({ open, location, onClose }: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [form, setForm] = useState(() => toForm(location))

  const [createLocation, create] = useCreateLocationMutation()
  const [replaceLocation, replace] = useReplaceLocationMutation()

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }, [])

  const complete = useMemo(
    () =>
      form.companyName.trim() !== '' &&
      form.street.trim() !== '' &&
      form.postalCode.trim() !== '' &&
      form.city.trim() !== '' &&
      form.country.trim() !== '',
    [form],
  )

  const submit = useCallback(async () => {
    const body = {
      companyName: form.companyName.trim(),
      street: form.street.trim(),
      postalCode: form.postalCode.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      additionalInfo: form.additionalInfo.trim() || null,
    }

    if (location) {
      await replaceLocation({ locationId: location.id, body }).unwrap()
    } else {
      await createLocation(body).unwrap()
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
            name="companyName"
            label={t('admin.locations.field.companyName')}
            value={form.companyName}
            onChange={handleChange}
          />
          <TextField
            required
            fullWidth
            name="street"
            label={t('admin.locations.field.street')}
            value={form.street}
            onChange={handleChange}
          />
          <div className="eos-form-dialog__row">
            <TextField
              required
              className="eos-form-dialog__field--postal"
              name="postalCode"
              label={t('admin.locations.field.postalCode')}
              value={form.postalCode}
              onChange={handleChange}
            />
            <TextField
              required
              fullWidth
              name="city"
              label={t('admin.locations.field.city')}
              value={form.city}
              onChange={handleChange}
            />
          </div>
          <TextField
            required
            fullWidth
            name="country"
            label={t('admin.locations.field.country')}
            value={form.country}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            multiline
            minRows={2}
            name="additionalInfo"
            label={t('admin.locations.field.additionalInfo')}
            value={form.additionalInfo}
            onChange={handleChange}
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
