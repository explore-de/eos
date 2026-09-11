import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { LocationRead } from '@/api/eosApi'
import { useDeleteLocationMutation, useListLocationsQuery } from '@/api/eosApi'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ErrorAlert } from '@/components/ErrorAlert'
import { PageHeader } from '@/components/PageHeader'
import { LocationCard } from '@/features/locations/components/LocationCard'
import { LocationFormDialog } from '@/features/locations/components/LocationFormDialog'
import { LocationQrDialog } from '@/features/locations/components/LocationQrDialog'
import './LocationsPage.css'

export function LocationsPage() {
  const { t } = useTranslation()
  const [editing, setEditing] = useState<LocationRead | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [qrFor, setQrFor] = useState<LocationRead | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<LocationRead | undefined>(undefined)

  const { data, error, isError, isLoading } = useListLocationsQuery({})
  const [deleteLocation, remove] = useDeleteLocationMutation()

  const locations = useMemo(() => data ?? [], [data])

  const confirmDeactivate = useCallback(async () => {
    if (!deactivating) return
    await deleteLocation({ locationId: deactivating.id }).unwrap()
    setDeactivating(undefined)
  }, [deactivating, deleteLocation])

  const handleConfirmDeactivate = useCallback(() => void confirmDeactivate(), [confirmDeactivate])

  const openCreateDialog = useCallback(() => {
    setEditing(undefined)
    setFormOpen(true)
  }, [])

  const openEditDialog = useCallback((location: LocationRead) => {
    setEditing(location)
    setFormOpen(true)
  }, [])

  const closeFormDialog = useCallback(() => setFormOpen(false), [])
  const closeQrDialog = useCallback(() => setQrFor(undefined), [])
  const closeDeactivateDialog = useCallback(() => setDeactivating(undefined), [])

  return (
    <div className="eos-locations">
      <PageHeader
        title={t('admin.locations.heading')}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            {t('admin.locations.create')}
          </Button>
        }
      />

      {isError ? <ErrorAlert error={error} /> : null}
      {remove.isError ? <ErrorAlert error={remove.error} /> : null}

      {isLoading ? (
        <div className="eos-locations__spinner">
          <CircularProgress aria-label={t('common.loading')} />
        </div>
      ) : locations.length === 0 ? (
        <Typography color="text.secondary" className="eos-locations__empty">
          {t('admin.locations.empty')}
        </Typography>
      ) : (
        <div className="eos-locations__grid">
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              onShowQr={setQrFor}
              onEdit={openEditDialog}
              onDeactivate={setDeactivating}
            />
          ))}
        </div>
      )}

      <LocationFormDialog
        key={`${editing?.id ?? 'new'}-${String(formOpen)}`}
        open={formOpen}
        location={editing}
        onClose={closeFormDialog}
      />

      <LocationQrDialog location={qrFor} onClose={closeQrDialog} />

      <ConfirmDialog
        open={deactivating !== undefined}
        title={t('admin.locations.deactivateHeading')}
        body={t('admin.locations.deactivateBody', { name: deactivating?.companyName ?? '' })}
        confirmLabel={t('common.delete')}
        pending={remove.isLoading}
        onConfirm={handleConfirmDeactivate}
        onClose={closeDeactivateDialog}
      />
    </div>
  )
}
