import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import EditIcon from '@mui/icons-material/EditOutlined'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { Location } from '@/api/types'
import './LocationCard.css'

interface Props {
  location: Location
  onShowQr: (location: Location) => void
  onEdit: (location: Location) => void
  onDelete: (location: Location) => void
}

export function LocationCard({ location, onShowQr, onEdit, onDelete }: Props) {
  const { t } = useTranslation()

  const showQr = useCallback(() => onShowQr(location), [location, onShowQr])
  const edit = useCallback(() => onEdit(location), [location, onEdit])
  const remove = useCallback(() => onDelete(location), [location, onDelete])

  return (
    <Card variant="outlined" className="eos-location-card">
      <CardContent>
        <div className="eos-location-card__head">
          <Typography variant="subtitle1" className="eos-location-card__name">
            {location.companyName}
          </Typography>
        </div>
        <Typography variant="body2" color="text.secondary">
          {location.street}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {location.postalCode} {location.city}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {location.country}
        </Typography>
        {location.additionalInfo ? (
          <Typography variant="body2" color="text.secondary" className="eos-location-card__info">
            {location.additionalInfo}
          </Typography>
        ) : null}
      </CardContent>
      <CardActions className="eos-location-card__actions">
        <Button size="small" startIcon={<QrCode2Icon />} onClick={showQr}>
          {t('admin.locations.qr')}
        </Button>
        <Button size="small" startIcon={<EditIcon />} onClick={edit}>
          {t('common.edit')}
        </Button>
        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={remove}>
          {t('common.delete')}
        </Button>
      </CardActions>
    </Card>
  )
}
