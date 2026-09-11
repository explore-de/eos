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

import type { Visit, VisitStatus } from '@/api/eosApi'
import { useDeleteVisitMutation, useListLocationsQuery, useListVisitsQuery } from '@/api/eosApi'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ErrorAlert } from '@/components/ErrorAlert'
import { PageHeader } from '@/components/PageHeader'
import { StatusFilterChip } from '@/features/visits/components/StatusFilterChip'
import { VisitFormDialog } from '@/features/visits/components/VisitFormDialog'
import { VisitList } from '@/features/visits/components/VisitList'
import './VisitsPage.css'

const STATUSES: VisitStatus[] = ['EXPECTED', 'ON_SITE', 'CHECKED_OUT']

interface Filters {
  q: string
  locationId: string
  status: VisitStatus[]
  from: string
  to: string
}

const emptyFilters: Filters = { q: '', locationId: '', status: [], from: '', to: '' }

export function VisitsPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(25)
  const [editing, setEditing] = useState<Visit | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Visit | undefined>(undefined)

  const locations = useListLocationsQuery({})
  const [deleteVisit, remove] = useDeleteVisitMutation()

  const listArgs = useMemo(
    () => ({
      page,
      size,
      ...(filters.q.trim() && { q: filters.q.trim() }),
      ...(filters.locationId && { locationId: filters.locationId }),
      ...(filters.status.length > 0 && { status: filters.status }),
      ...(filters.from && { from: filters.from }),
      ...(filters.to && { to: filters.to }),
    }),
    [filters, page, size],
  )

  const visits = useListVisitsQuery(listArgs)

  const items = useMemo(() => visits.data?.items ?? [], [visits.data])
  const locationOptions = useMemo(() => locations.data ?? [], [locations.data])

  const setFilter = useCallback((key: keyof Filters, value: string | VisitStatus[]) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(0)
  }, [])

  const handleFilterChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(0)
  }, [])

  const toggleStatus = useCallback(
    (status: VisitStatus) =>
      setFilter(
        'status',
        filters.status.includes(status)
          ? filters.status.filter((entry) => entry !== status)
          : [...filters.status, status],
      ),
    [filters.status, setFilter],
  )

  const confirmDelete = useCallback(async () => {
    if (!deleting) return
    await deleteVisit({ visitId: deleting.id }).unwrap()
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
            fullWidth
            size="small"
            label={t('admin.visits.filter.query')}
            name="q"
            value={filters.q}
            onChange={handleFilterChange}
          />
          <TextField
            select
            fullWidth
            size="small"
            label={t('admin.visits.filter.location')}
            name="locationId"
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
            label={t('admin.visits.filter.from')}
            name="from"
            value={filters.from}
            onChange={handleFilterChange}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            type="date"
            label={t('admin.visits.filter.to')}
            name="to"
            value={filters.to}
            onChange={handleFilterChange}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <div className="eos-visits__status-chips">
            {STATUSES.map((status) => (
              <StatusFilterChip
                key={status}
                status={status}
                selected={filters.status.includes(status)}
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
            count={visits.data?.totalElements ?? 0}
            page={page}
            rowsPerPage={size}
            rowsPerPageOptions={[25, 50, 100]}
            labelRowsPerPage={t('common.rowsPerPage')}
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
