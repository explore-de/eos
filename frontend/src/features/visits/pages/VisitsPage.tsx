import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { ChangeEvent } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useDeleteVisitMutation, useListLocationsQuery, useListVisitsQuery } from '@/api/eosApi'
import type { Visit, VisitStatus } from '@/api/types'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ErrorAlert } from '@/components/ErrorAlert'
import { PageHeader } from '@/components/PageHeader'
import { StatusFilterChip } from '../components/StatusFilterChip'
import { VisitFormDialog } from '../components/VisitFormDialog'
import { VisitList } from '../components/VisitList'
import './VisitsPage.css'

const STATUSES: VisitStatus[] = ['REGISTERED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED']

interface Filters {
  date: string
  locationId: string
  status: VisitStatus | ''
}

const emptyFilters: Filters = { date: '', locationId: '', status: '' }

export function VisitsPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(25)
  const [editing, setEditing] = useState<Visit | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Visit | undefined>(undefined)

  const locations = useListLocationsQuery()
  const [deleteVisit, remove] = useDeleteVisitMutation()

  const query = useMemo(
    () => ({
      limit: size,
      offset: page * size,
      ...(filters.date && { date: filters.date }),
      ...(filters.locationId && { locationId: filters.locationId }),
      ...(filters.status && { status: filters.status }),
    }),
    [filters, page, size],
  )

  const visits = useListVisitsQuery(query)

  const items = useMemo(() => visits.data ?? [], [visits.data])
  const locationOptions = useMemo(() => locations.data ?? [], [locations.data])

  const handleFilterChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(0)
  }, [])

  const toggleStatus = useCallback((status: VisitStatus) => {
    setFilters((current) => ({ ...current, status: current.status === status ? '' : status }))
    setPage(0)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleting) return
    await deleteVisit(deleting.id).unwrap()
    setDeleting(undefined)
  }, [deleteVisit, deleting])

  const handleConfirmDelete = useCallback(() => void confirmDelete(), [confirmDelete])

  const openCreateDialog = useCallback(() => {
    setEditing(undefined)
    setFormOpen(true)
  }, [])

  const openEditDialog = useCallback((visit: Visit) => {
    setEditing(visit)
    setFormOpen(true)
  }, [])

  const closeFormDialog = useCallback(() => setFormOpen(false), [])
  const closeDeleteDialog = useCallback(() => setDeleting(undefined), [])
  const resetFilters = useCallback(() => setFilters(emptyFilters), [])

  const changePage = useCallback((_: unknown, next: number) => setPage(next), [])

  const changeRowsPerPage = useCallback((event: { target: { value: string } }) => {
    setSize(Number(event.target.value))
    setPage(0)
  }, [])

  return (
    <div className="eos-visits">
      <PageHeader
        title={t('admin.visits.heading')}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            {t('admin.visits.create')}
          </Button>
        }
      />

      <Paper variant="outlined" className="eos-visits__filters">
        <div className="eos-visits__filter-row">
          <TextField
            select
            fullWidth
            size="small"
            name="locationId"
            label={t('admin.visits.filter.location')}
            value={filters.locationId}
            onChange={handleFilterChange}
            className="eos-visits__location"
          >
            <MenuItem value="">{t('admin.visits.filter.allLocations')}</MenuItem>
            {locationOptions.map((location) => (
              <MenuItem key={location.id} value={location.id}>
                {location.companyName}
              </MenuItem>
            ))}
          </TextField>
        </div>
        <div className="eos-visits__filter-row eos-visits__filter-row--dates">
          <TextField
            size="small"
            type="date"
            name="date"
            label={t('admin.visits.filter.date')}
            value={filters.date}
            onChange={handleFilterChange}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <div className="eos-visits__status-chips">
            {STATUSES.map((status) => (
              <StatusFilterChip
                key={status}
                status={status}
                selected={filters.status === status}
                onToggle={toggleStatus}
              />
            ))}
          </div>
          <div className="eos-visits__spacer" />
          <Button size="small" onClick={resetFilters}>
            {t('common.reset')}
          </Button>
        </div>
      </Paper>

      {visits.isError ? <ErrorAlert error={visits.error} /> : null}
      {remove.isError ? <ErrorAlert error={remove.error} /> : null}

      {visits.isLoading ? (
        <div className="eos-visits__spinner">
          <CircularProgress aria-label={t('common.loading')} />
        </div>
      ) : items.length === 0 ? (
        <Typography color="text.secondary" className="eos-visits__empty">
          {t('admin.visits.empty')}
        </Typography>
      ) : (
        <>
          <VisitList visits={items} onEdit={openEditDialog} onDelete={setDeleting} />
          <TablePagination
            component="div"
            count={-1}
            page={page}
            rowsPerPage={size}
            rowsPerPageOptions={[25, 50, 100]}
            labelRowsPerPage={t('common.rowsPerPage')}
            labelDisplayedRows={({ from, to }) => `${from}–${to}`}
            slotProps={{ actions: { nextButton: { disabled: items.length < size } } }}
            onPageChange={changePage}
            onRowsPerPageChange={changeRowsPerPage}
          />
        </>
      )}

      <VisitFormDialog
        key={`${editing?.id ?? 'new'}-${String(formOpen)}`}
        open={formOpen}
        visit={editing}
        locations={locationOptions}
        onClose={closeFormDialog}
      />

      <ConfirmDialog
        open={deleting !== undefined}
        title={t('admin.visits.deleteHeading')}
        body={t('admin.visits.deleteBody', { name: deleting?.visitorName ?? '' })}
        confirmLabel={t('common.delete')}
        pending={remove.isLoading}
        onConfirm={handleConfirmDelete}
        onClose={closeDeleteDialog}
      />
    </div>
  )
}
