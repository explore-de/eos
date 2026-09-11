import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

import './PageHeader.css'

interface Props {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: Props) {
  return (
    <header className="eos-page-header">
      <div>
        <Typography variant="h5" component="h2" className="eos-page-header__title">
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" className="eos-page-header__subtitle">
            {subtitle}
          </Typography>
        ) : null}
      </div>
      {action ? <div className="eos-page-header__action">{action}</div> : null}
    </header>
  )
}
