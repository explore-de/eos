import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router'

import './LogoutPage.css'

export function LogoutPage() {
  const { t } = useTranslation()

  return (
    <Paper variant="outlined" className="eos-logout">
      <div className="eos-logout__icon">
        <LockOutlinedIcon />
      </div>
      <Typography variant="h5" component="h2">
        {t('admin.logout.heading')}
      </Typography>
      <Typography color="text.secondary">{t('admin.logout.body')}</Typography>
      <Button component={RouterLink} to="/admin/visits" variant="contained" size="large">
        {t('admin.logout.signIn')}
      </Button>
    </Paper>
  )
}
