import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { Badge } from '../components/ui'
import { formatDateTime, initials } from '../lib/format'

interface RiderRow {
  id: string
  user_id?: string
  name?: string
  phone?: string
  email?: string
  status?: string
  is_verified?: boolean
  is_approved?: boolean
  approved?: boolean
  online?: boolean
  rating?: number
  total_deliveries?: number
  vehicle_type?: string
  vehicle_number?: string
  license_number?: string
  id_number?: string
  selfie_url?: string
  id_front_url?: string
  id_back_url?: string
  good_conduct_url?: string
  insurance_url?: string
  driving_license_url?: string
  documents_submitted_at?: string
  created_at?: string
  profile?: { name?: string; phone?: string; email?: string } | null
}

const statusOptions = ['pending', 'approved', 'suspended', 'rejected']

export default function Riders() {
  const [riders, setRiders] = useState<RiderRow[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    return apiFetch('/api/admin/riders')
      .then((res) => res.json() as Promise<{ data?: { riders?: RiderRow[] } }>)
      .then((body) => {
        setRiders(body.data?.riders ?? [])
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load riders')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const approve = async (id: string) => {
    setBusyId(id)
    setError(null)
    await apiFetch(`/api/admin/riders/${id}/approve`, { method: 'PATCH' })
      .then((res) => res.json() as Promise<{ success?: boolean; error?: string }>)
      .then((result) => {
        if (result.success) {
          void load()
        } else {
          setError(result.error ?? 'Failed to approve rider')
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to approve rider')
      })
      .finally(() => setBusyId(null))
  }

  const resetDocuments = async (id: string) => {
    setBusyId(id)
    setError(null)
    await apiFetch(`/api/admin/riders/${id}/documents/reset`, {
      method: 'PATCH',
    })
      .then(
        (res) => res.json() as Promise<{ success?: boolean; error?: string }>,
      )
      .then((result) => {
        if (result.success) {
          void load()
        } else {
          setError(result.error ?? 'Failed to reset rider documents')
        }
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to reset rider documents',
        )
      })
      .finally(() => setBusyId(null))
  }

  const filterBase = [
    'py-1.5 px-3 rounded-full border text-xs font-medium transition',
    'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-700',
  ].join(' ')
  const filterActive = [
    'py-1.5 px-3 rounded-full border text-xs font-medium transition',
    'border-purple-600 bg-purple-600 text-white',
  ].join(' ')

  const riderName = (rider: RiderRow) =>
    rider.name ?? rider.profile?.name ?? rider.profile?.email ?? 'Unnamed rider'
  const riderPhone = (rider: RiderRow) =>
    rider.phone ?? rider.profile?.phone ?? '—'
  const isApproved = (rider: RiderRow) =>
    rider.is_verified ??
    rider.is_approved ??
    rider.approved ??
    rider.status === 'approved'

  const documents = (rider: RiderRow) =>
    [
      { label: 'Selfie', url: rider.selfie_url },
      { label: 'ID front', url: rider.id_front_url },
      { label: 'ID back', url: rider.id_back_url },
      { label: 'Good conduct', url: rider.good_conduct_url },
      { label: 'Insurance', url: rider.insurance_url },
      { label: 'Driving licence', url: rider.driving_license_url },
    ].filter((doc): doc is { label: string; url: string } => Boolean(doc.url))

  const riderStatus = (rider: RiderRow) =>
    rider.status ?? (isApproved(rider) ? 'approved' : 'pending')

  const visibleRiders = riders.filter(
    (rider) => status === '' || riderStatus(rider) === status,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Riders
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Approve and manage delivery partners.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatus('')}
          className={status === '' ? filterActive : filterBase}
        >
          All
        </button>
        {statusOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatus(option)}
            className={status === option ? filterActive : filterBase}
          >
            {option}
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
          Loading riders...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              setError(null)
              void load()
            }}
            className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {visibleRiders.length === 0 ? (
            <p className="rounded-xl bg-gray-50 p-8 text-center text-sm text-gray-500">
              No riders match the current filter.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleRiders.map((rider) => (
                <div
                  key={rider.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                        {initials(riderName(rider))}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {riderName(rider)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {riderPhone(rider)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {rider.online ? (
                        <Badge tone="green">Online</Badge>
                      ) : (
                        <Badge tone="gray">Offline</Badge>
                      )}
                      {isApproved(rider) ? (
                        <Badge tone="green">Approved</Badge>
                      ) : (
                        <Badge tone="amber">{riderStatus(rider)}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-3 text-center">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {rider.total_deliveries ?? 0}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Deliveries
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {rider.rating ?? '—'}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Rating
                      </p>
                    </div>
                    <div>
                      <p className="truncate text-sm font-bold text-gray-900">
                        {rider.vehicle_type ?? '—'}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Vehicle
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-400">
                      Joined {formatDateTime(rider.created_at)}
                    </p>
                    {!isApproved(rider) && (
                      <button
                        type="button"
                        disabled={busyId === rider.id}
                        onClick={() => void approve(rider.id)}
                        className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60"
                      >
                        Approve
                      </button>
                    )}
                    {rider.documents_submitted_at && (
                      <button
                        type="button"
                        disabled={busyId === rider.id}
                        onClick={() => void resetDocuments(rider.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="mt-3 rounded-lg border border-gray-100 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Verification documents
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {(rider.id_number || rider.license_number) && (
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          {[rider.id_number && `ID ${rider.id_number}`, rider.license_number && `Licence ${rider.license_number}`]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      )}
                      {documents(rider).map((doc) => (
                        <a
                          key={doc.label}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50"
                          title={doc.label}
                        >
                          <img
                            src={doc.url}
                            alt={doc.label}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        </a>
                      ))}
                      {!rider.documents_submitted_at &&
                        documents(rider).length === 0 && (
                          <span className="text-xs text-gray-400">
                            No documents submitted yet
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
