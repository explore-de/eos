import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import type { Visit } from '@/api/eosApi'
import { StatusChip } from '@/components/StatusChip'
import { VisitActions } from './VisitActions'
import './VisitCard.css'

interface Props {
  visit: Visit
  onEdit: (visit: Visit) => void
  onDelete: (visit: Visit) => void
}

export function VisitCard({ visit, onEdit, onDelete }: Props) {
  return (
    <Card variant="outlined" className="eos-visit-card">
      <CardContent>
        <div className="eos-visit-card__head">
          <div>
            <Typography variant="subtitle1" className="eos-visit-card__name">
              {visit.visitorName}
            </Typography>
            {visit.visitorCompany ? (
              <Typography variant="body2" color="text.secondary">
                {visit.visitorCompany}
              </Typography>
            ) : null}
          </div>
          <StatusChip status={visit.status} />
        </div>
        <Typography variant="body2" color="text.secondary" className="eos-visit-card__meta">
          {visit.visitDate}
          {visit.hostName ? ` · ${visit.hostName}` : ''}
        </Typography>
        <div className="eos-visit-card__actions">
          <VisitActions visit={visit} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </CardContent>
    </Card>
  )
}
