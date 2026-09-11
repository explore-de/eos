import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { LanguageSwitcher } from '../components/LanguageSwitcher'
import './VisitorLayout.css'

export function VisitorLayout() {
  const { t } = useTranslation()

  return (
    <div className="eos-visitor">
      <AppBar position="sticky" className="eos-visitor__bar" enableColorOnDark>
        <Toolbar className="eos-visitor__toolbar">
          <Typography variant="subtitle1" component="h1" noWrap className="eos-visitor__brand">
            {t('app.title')}
          </Typography>
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>
      <main className="eos-visitor__main">
        <Outlet />
      </main>
    </div>
  )
}
