import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

import type { Visit } from '@/api/eosApi'
import { StatusChip } from '@/components/StatusChip'
import { VisitActions } from './VisitActions'
import { VisitCard } from './VisitCard'
import './VisitList.css'

interface Props {
  visits: Visit[]
  onEdit: (visit: Visit) => void
  onDelete: (visit: Visit) => void
}

export function VisitList({ visits, onEdit, onDelete }: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const wide = useMediaQuery(theme.breakpoints.up('md'))

  if (!wide) {
    return (
      <div className="eos-visits-cards">
        {visits.map((visit) => (
          <VisitCard key={visit.id} visit={visit} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined" className="eos-visits-table">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('visit.field.visitorName')}</TableCell>
            <TableCell>{t('visit.field.visitorCompany')}</TableCell>
            <TableCell>{t('visit.field.visitDate')}</TableCell>
            <TableCell>{t('visit.field.hostName')}</TableCell>
            <TableCell>{t('visit.status.label')}</TableCell>
            <TableCell align="right">{t('common.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visits.map((visit) => (
            <TableRow key={visit.id} hover>
              <TableCell>{visit.visitorName}</TableCell>
              <TableCell>{visit.visitorCompany ?? t('common.none')}</TableCell>
              <TableCell>{visit.visitDate}</TableCell>
              <TableCell>{visit.hostName ?? t('common.none')}</TableCell>
              <TableCell>
                <StatusChip status={visit.status} />
              </TableCell>
              <TableCell align="right">
                <VisitActions visit={visit} onEdit={onEdit} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
