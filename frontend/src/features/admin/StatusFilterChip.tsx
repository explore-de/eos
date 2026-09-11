import Chip from '@mui/material/Chip'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { VisitStatus } from '../../api/eosApi'

interface Props {
  status: VisitStatus
  selected: boolean
  onToggle: (status: VisitStatus) => void
}

export function StatusFilterChip({ status, selected, onToggle }: Props) {
  const { t } = useTranslation()

  const toggle = useCallback(() => onToggle(status), [onToggle, status])

  return (
    <Chip
      label={t(`visit.status.${status}`)}
      size="small"
      variant={selected ? 'filled' : 'outlined'}
      color={selected ? 'primary' : 'default'}
      onClick={toggle}
    />
  )
}
