import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { Location } from '@/api/types'
import './LocationQrDialog.css'

interface Props {
  location?: Location
  onClose: () => void
}

export function LocationQrDialog({ location, onClose }: Props) {
  const { t } = useTranslation()
  const [rendered, setRendered] = useState<{ forUrl: string; dataUrl: string } | undefined>(
    undefined,
  )

  const checkInUrl = location ? `${window.location.origin}/check-in/${location.id}` : ''
  const dataUrl = rendered?.forUrl === checkInUrl ? rendered.dataUrl : undefined

  useEffect(() => {
    if (!checkInUrl) return

    let active = true
    void QRCode.toDataURL(checkInUrl, { width: 640, margin: 2 }).then((url) => {
      if (active) setRendered({ forUrl: checkInUrl, dataUrl: url })
    })

    return () => {
      active = false
    }
  }, [checkInUrl])

  return (
    <Dialog open={location !== undefined} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {t('admin.locations.qrHeading', { name: location?.companyName ?? '' })}
      </DialogTitle>
      <DialogContent>
        <div className="eos-qr__frame">
          {dataUrl ? (
            <img className="eos-qr__image" src={dataUrl} alt={t('admin.locations.qr')} />
          ) : (
            <CircularProgress aria-label={t('common.loading')} />
          )}
        </div>
        <Typography variant="body2" color="text.secondary" className="eos-qr__hint">
          {t('admin.locations.qrHint')}
        </Typography>
        <Typography variant="caption" color="text.secondary" className="eos-qr__url">
          {checkInUrl}
        </Typography>
      </DialogContent>
      <DialogActions>
        {dataUrl ? (
          <Button component="a" href={dataUrl} download={`qr-${location?.id ?? 'location'}.png`}>
            {t('common.download')}
          </Button>
        ) : null}
        <Button onClick={onClose}>{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  )
}
