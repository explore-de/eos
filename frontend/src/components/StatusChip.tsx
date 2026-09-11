import Chip from '@mui/material/Chip'
import { useTranslation } from 'react-i18next'

import type { VisitStatus } from '@/api/eosApi'
import './StatusChip.css'

export function StatusChip({ status }: { status: VisitStatus }) {
  const { t } = useTranslation()

  return (
    <Chip
      size="small"
      className={`eos-status eos-status--${status}`}
      label={t(`visit.status.${status}`)}
    />
  )
}
