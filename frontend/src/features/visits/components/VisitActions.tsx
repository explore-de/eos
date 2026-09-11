import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import EditIcon from '@mui/icons-material/EditOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useLazyVisitorPassPdfQuery } from '@/api/binaryApi'
import { useCheckOutVisitMutation } from '@/api/eosApi'
import type { Visit } from '@/api/types'
import './VisitActions.css'

interface Props {
  visit: Visit
  onEdit: (visit: Visit) => void
  onDelete: (visit: Visit) => void
}

export function VisitActions({ visit, onEdit, onDelete }: Props) {
  const { t } = useTranslation()
  const [checkOutVisit, checkOut] = useCheckOutVisitMutation()
  const [fetchPass, pass] = useLazyVisitorPassPdfQuery()

  const openPass = useCallback(async () => {
    const blob = await fetchPass(visit.id).unwrap()
    window.open(URL.createObjectURL(blob), '_blank', 'noopener')
  }, [fetchPass, visit.id])

  const handleOpenPass = useCallback(() => void openPass(), [openPass])

  const checkOutOfVisit = useCallback(() => void checkOutVisit(visit.id), [checkOutVisit, visit.id])

  const edit = useCallback(() => onEdit(visit), [onEdit, visit])

  const remove = useCallback(() => onDelete(visit), [onDelete, visit])

  return (
    <div className="eos-visit-actions">
      {visit.status === 'CHECKED_IN' ? (
        <Tooltip title={t('admin.visits.checkOut')}>
          <span>
            <IconButton
              aria-label={t('admin.visits.checkOut')}
              disabled={checkOut.isLoading}
              onClick={checkOutOfVisit}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
      <Tooltip title={t('admin.visits.pass')}>
        <span>
          <IconButton
            aria-label={t('admin.visits.pass')}
            disabled={pass.isLoading}
            onClick={handleOpenPass}
          >
            <PictureAsPdfIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t('common.edit')}>
        <IconButton aria-label={t('common.edit')} onClick={edit}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('common.delete')}>
        <IconButton aria-label={t('common.delete')} onClick={remove}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  )
}
