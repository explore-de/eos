import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'

import { useAppSelector } from '@/app/hooks'

import './ScanPromptPage.css'

export function ScanPromptPage() {
  const { t } = useTranslation()
  const session = useAppSelector((state) => state.auth.visit)

  if (session) {
    return <Navigate to={`/visit/${session.visitId}`} replace />
  }

  return (
    <Paper variant="outlined" className="eos-scan">
      <div className="eos-scan__icon">
        <QrCodeScannerIcon />
      </div>
      <Typography variant="h6" component="h2">
        {t('visitor.scan.heading')}
      </Typography>
      <Typography color="text.secondary">{t('visitor.scan.body')}</Typography>
    </Paper>
  )
}
