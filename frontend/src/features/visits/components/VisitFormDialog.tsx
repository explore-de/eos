import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import type { ChangeEvent } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { LocationRead, Visit } from '@/api/eosApi'
import { useCreateVisitMutation, useUpdateVisitMutation } from '@/api/eosApi'
import { toContactInfo } from '@/api/toContactInfo'
import { ErrorAlert } from '@/components/ErrorAlert'
import '@/styles/form-dialog.css'

interface Props {
  open: boolean
  visit?: Visit
  locations: LocationRead[]
  onClose: () => void
}

interface FormState {
  locationId: string
  visitorName: string
  visitorCompany: string
  visitDate: string
  purpose: string
  hostName: string
  email: string
  phone: string
}

const today = () => new Date().toISOString().slice(0, 10)

const toForm = (visit: Visit | undefined, fallbackLocationId: string): FormState => ({
  locationId: visit?.locationId ?? fallbackLocationId,
  visitorName: visit?.visitorName ?? '',
  visitorCompany: visit?.visitorCompany ?? '',
  visitDate: visit?.visitDate ?? today(),
  purpose: visit?.purpose ?? '',
  hostName: visit?.hostName ?? '',
  email: visit?.contact.email ?? '',
  phone: visit?.contact.email ? '' : (visit?.contact.text ?? ''),
})

export function VisitFormDialog({ open, visit, locations, onClose }: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [form, setForm] = useState(() => toForm(visit, locations[0]?.id ?? ''))

  const [createVisit, create] = useCreateVisitMutation()
  const [updateVisit, update] = useUpdateVisitMutation()

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }, [])

  const complete = useMemo(
    () =>
      form.locationId !== '' &&
      form.visitorName.trim() !== '' &&
      form.purpose.trim() !== '' &&
      form.visitDate !== '' &&
      (form.email.trim() !== '' || form.phone.trim() !== ''),
    [form],
  )

  const contact = useMemo(() => toContactInfo(form.email, form.phone), [form.email, form.phone])

  const submit = useCallback(async () => {
    if (visit) {
      await updateVisit({
        visitId: visit.id,
        'If-Match': '*',
        visitUpdateRequest: {
          visitorName: form.visitorName.trim(),
          visitorCompany: form.visitorCompany.trim() || null,
          visitDate: form.visitDate,
          purpose: form.purpose.trim(),
          hostName: form.hostName.trim() || null,
          contact,
        },
      }).unwrap()
    } else {
      await createVisit({
        visitCreateRequest: {
          locationId: form.locationId,
          visitorName: form.visitorName.trim(),
          ...(form.visitorCompany.trim() && { visitorCompany: form.visitorCompany.trim() }),
          visitDate: form.visitDate,
          purpose: form.purpose.trim(),
          ...(form.hostName.trim() && { hostName: form.hostName.trim() }),
          contact,
        },
      }).unwrap()
    }
    onClose()
  }, [contact, createVisit, form, onClose, updateVisit, visit])

  const handleSubmit = useCallback(() => void submit(), [submit])

  const pending = create.isLoading || update.isLoading

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
        {t(visit ? 'admin.visits.editHeading' : 'admin.visits.createHeading')}
      </DialogTitle>
      <DialogContent>
        <div className="eos-form-dialog__content">
          {create.isError ? <ErrorAlert error={create.error} /> : null}
          {update.isError ? <ErrorAlert error={update.error} /> : null}
          {visit ? null : (
            <TextField
              select
              required
              fullWidth
              label={t('visit.field.location')}
              name="locationId"
              value={form.locationId}
              onChange={handleChange}
            >
              {locations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.companyName}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            required
            fullWidth
            label={t('visit.field.visitorName')}
            name="visitorName"
            value={form.visitorName}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label={t('visit.field.visitorCompany')}
            name="visitorCompany"
            value={form.visitorCompany}
            onChange={handleChange}
          />
          <TextField
            required
            fullWidth
            type="date"
            label={t('visit.field.visitDate')}
            name="visitDate"
            value={form.visitDate}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
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
          <div className="eos-form-dialog__row">
            <TextField
              fullWidth
              type="email"
              label={t('visit.field.email')}
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              type="tel"
              label={t('visit.field.phone')}
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
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
