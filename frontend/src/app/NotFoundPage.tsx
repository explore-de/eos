import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

export function NotFoundPage() {
  const { t } = useTranslation()

  return <Typography variant="h5">{t('error.notFound')}</Typography>
}
