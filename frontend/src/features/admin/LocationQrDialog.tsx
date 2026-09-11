import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { LocationRead } from '../../api/eosApi'
import { useLocationQrPngQuery } from '../../api/binaryApi'
import { ErrorAlert } from '../../components/ErrorAlert'
import './LocationQrDialog.css'

interface Props {
  location?: LocationRead
  onClose: () => void
}

export function LocationQrDialog({ location, onClose }: Props) {
  const { t } = useTranslation()
  const { data, error, isError, isLoading } = useLocationQrPngQuery(
    { locationId: location?.id ?? '' },
    { skip: !location },
  )

  const objectUrl = useMemo(() => (data ? URL.createObjectURL(data) : undefined), [data])

  useEffect(() => {
    if (!objectUrl) return
    return () => URL.revokeObjectURL(objectUrl)
  }, [objectUrl])

  return (
    <Dialog open={location !== undefined} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {t('admin.locations.qrHeading', { name: location?.companyName ?? '' })}
      </DialogTitle>
      <DialogContent>
        <div className="eos-qr__frame">
          {isLoading ? <CircularProgress aria-label={t('common.loading')} /> : null}
          {isError ? <ErrorAlert error={error} /> : null}
          {objectUrl ? (
            <img className="eos-qr__image" src={objectUrl} alt={t('admin.locations.qr')} />
          ) : null}
        </div>
        <Typography variant="body2" color="text.secondary" className="eos-qr__hint">
          {t('admin.locations.qrHint')}
        </Typography>
      </DialogContent>
      <DialogActions>
        {objectUrl ? (
          <Button component="a" href={objectUrl} download={`qr-${location?.id ?? 'location'}.png`}>
            {t('common.download')}
          </Button>
        ) : null}
        <Button onClick={onClose}>{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  )
}
