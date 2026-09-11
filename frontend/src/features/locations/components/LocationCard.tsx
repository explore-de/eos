import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import EditIcon from '@mui/icons-material/EditOutlined'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { LocationRead } from '@/api/eosApi'
import './LocationCard.css'

interface Props {
  location: LocationRead
  onShowQr: (location: LocationRead) => void
  onEdit: (location: LocationRead) => void
  onDeactivate: (location: LocationRead) => void
}

export function LocationCard({ location, onShowQr, onEdit, onDeactivate }: Props) {
  const { t } = useTranslation()

  const showQr = useCallback(() => onShowQr(location), [location, onShowQr])
  const edit = useCallback(() => onEdit(location), [location, onEdit])
  const deactivate = useCallback(() => onDeactivate(location), [location, onDeactivate])

  return (
    <Card
      variant="outlined"
      className={`eos-location-card${location.active ? '' : ' eos-location-card--inactive'}`}
    >
      <CardContent>
        <div className="eos-location-card__head">
          <Typography variant="subtitle1" className="eos-location-card__name">
            {location.companyName}
          </Typography>
          {location.active ? null : <Chip size="small" label={t('admin.locations.inactive')} />}
        </div>
        <Typography variant="body2" color="text.secondary">
          {location.address.street}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {location.address.postalCode} {location.address.city}
        </Typography>
        {typeof location.onSiteCount === 'number' ? (
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            className="eos-location-card__count"
            label={`${location.onSiteCount} ${t('admin.locations.onSiteCount')}`}
          />
        ) : null}
      </CardContent>
      <CardActions className="eos-location-card__actions">
        <Button size="small" startIcon={<QrCode2Icon />} onClick={showQr}>
          {t('admin.locations.qr')}
        </Button>
        <Button size="small" startIcon={<EditIcon />} onClick={edit}>
          {t('common.edit')}
        </Button>
        {location.active ? (
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={deactivate}>
            {t('common.delete')}
          </Button>
        ) : null}
      </CardActions>
    </Card>
  )
}
