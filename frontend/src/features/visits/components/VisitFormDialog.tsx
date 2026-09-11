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

import { useCreateVisitMutation, useUpdateVisitMutation } from '@/api/eosApi'
import type { Location, Visit, VisitStatus } from '@/api/types'
import { ErrorAlert } from '@/components/ErrorAlert'
import '@/styles/form-dialog.css'

interface Props {
  open: boolean
  visit?: Visit
  locations: Location[]
  onClose: () => void
}

interface FormState {
  locationId: string
  visitorName: string
  visitorCompany: string
  visitDate: string
  purpose: string
  hostName: string
  contactInfo: string
  status: VisitStatus
}

const STATUSES: VisitStatus[] = ['REGISTERED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED']

const today = () => new Date().toISOString().slice(0, 10)

const toForm = (visit: Visit | undefined, fallbackLocationId: string): FormState => ({
  locationId: visit?.locationId ?? fallbackLocationId,
  visitorName: visit?.visitorName ?? '',
  visitorCompany: visit?.visitorCompany ?? '',
  visitDate: visit?.visitDate ?? today(),
  purpose: visit?.purpose ?? '',
  hostName: visit?.hostName ?? '',
  contactInfo: visit?.contactInfo ?? '',
  status: visit?.status ?? 'REGISTERED',
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
      form.hostName.trim() !== '' &&
      form.visitDate !== '',
    [form],
  )

  const submit = useCallback(async () => {
    const body = {
      locationId: form.locationId,
      visitorName: form.visitorName.trim(),
      visitorCompany: form.visitorCompany.trim() || null,
      visitDate: form.visitDate,
      purpose: form.purpose.trim(),
      hostName: form.hostName.trim(),
      contactInfo: form.contactInfo.trim() || null,
      status: form.status,
    }

    if (visit) {
      await updateVisit({ visitId: visit.id, body }).unwrap()
    } else {
      await createVisit(body).unwrap()
    }
    onClose()
  }, [createVisit, form, onClose, updateVisit, visit])

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
          <TextField
            select
            required
            fullWidth
            name="locationId"
            label={t('visit.field.location')}
            value={form.locationId}
            onChange={handleChange}
          >
            {locations.map((location) => (
              <MenuItem key={location.id} value={location.id}>
                {location.companyName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            required
            fullWidth
            name="visitorName"
            label={t('visit.field.visitorName')}
            value={form.visitorName}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            name="visitorCompany"
            label={t('visit.field.visitorCompany')}
            value={form.visitorCompany}
            onChange={handleChange}
          />
          <div className="eos-form-dialog__row">
            <TextField
              required
              fullWidth
              type="date"
              name="visitDate"
              label={t('visit.field.visitDate')}
              value={form.visitDate}
              onChange={handleChange}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              select
              fullWidth
              name="status"
              label={t('visit.status.label')}
              value={form.status}
              onChange={handleChange}
            >
              {STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {t(`visit.status.${status}`)}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <TextField
            required
            fullWidth
            multiline
            minRows={2}
            name="purpose"
            label={t('visit.field.purpose')}
            value={form.purpose}
            onChange={handleChange}
          />
          <TextField
            required
            fullWidth
            name="hostName"
            label={t('visit.field.hostName')}
            value={form.hostName}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            name="contactInfo"
            label={t('visit.field.contactInfo')}
            value={form.contactInfo}
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
