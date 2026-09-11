import Typography from '@mui/material/Typography'

import './BadgeField.css'

interface Props {
  label: string
  value?: string
}

export function BadgeField({ label, value }: Props) {
  if (!value) return null

  return (
    <div>
      <Typography variant="caption" color="text.secondary" className="eos-badge-field__label">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </div>
  )
}
