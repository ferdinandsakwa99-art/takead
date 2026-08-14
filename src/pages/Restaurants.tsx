import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { Badge } from '../components/ui'
import { statusTone } from '../lib/status'
import { formatDateTime, initials } from '../lib/format'

interface RestaurantRow {
  id: string
  name?: string
  email?: string
  phone?: string
  location?: string
  address?: string
  cover_image?: string
  logo_url?: string
  status?: string
  created_at?: string
  id_number?: string
  id_front_url?: string
  id_back_url?: string
  documents_submitted_at?: string
  owner?: { name?: string; phone?: string } | null
}

const statusOptions = ['pending', 'approved', 'active', 'suspended', 'rejected']

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    return apiFetch('/api/restaurants')
      .then(
        (res) =>
          res.json() as Promise<{ data?: { restaurants?: RestaurantRow[] } }>,
      )
      .then((body) => {
        setRestaurants(body.data?.restaurants ?? [])
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load restaurants')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const visibleRestaurants = restaurants.filter(
    (restaurant) =>
      status === '' || (restaurant.status ?? 'pending') === status,
  )

  const approve = async (id: string) => {
    setBusyId(id)
    setError(null)
    await apiFetch(`/api/admin/restaurants/${id}/approve`, {
      method: 'PATCH',
    })
      .then((res) => res.json() as Promise<{ success?: boolean; error?: string }>)
      .then((result) => {
        if (result.success) {
          void load()
        } else {
          setError(result.error ?? 'Failed to approve restaurant')
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to approve restaurant')
      })
      .finally(() => setBusyId(null))
  }

  const resetDocuments = async (id: string) => {
    setBusyId(id)
    setError(null)
    await apiFetch(`/api/admin/restaurants/${id}/documents/reset`, {
      method: 'PATCH',
    })
      .then(
        (res) => res.json() as Promise<{ success?: boolean; error?: string }>,
      )
      .then((result) => {
        if (result.success) {
          void load()
        } else {
          setError(result.error ?? 'Failed to reset restaurant documents')
        }
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to reset restaurant documents',
        )
      })
      .finally(() => setBusyId(null))
  }

  const setRestaurantStatus = async (id: string, next: string) => {
    setBusyId(id)
    setError(null)
    await apiFetch(`/api/admin/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: next }),
    })
      .then((res) => res.json() as Promise<{ success?: boolean; error?: string }>)
      .then((result) => {
        if (result.success) {
          void load()
        } else {
          setError(result.error ?? 'Failed to update restaurant')
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to update restaurant')
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Restaurants
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review, approve and manage partner restaurants.
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
          Loading restaurants...
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
          {visibleRestaurants.length === 0 ? (
            <p className="rounded-xl bg-gray-50 p-8 text-center text-sm text-gray-500">
              No restaurants match the current filter.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="overflow-hidden rounded-xl border border-gray-200"
                >
                  <div className="relative h-28 bg-gradient-to-br from-purple-100 to-indigo-100">
                    {restaurant.cover_image && (
                      <img
                        src={restaurant.cover_image}
                        alt={restaurant.name ?? 'Restaurant'}
                        className="h-full w-full object-cover"
                      />
                    )}
                    <div className="absolute left-3 top-3">
                      <Badge tone={statusTone(restaurant.status)}>
                        {restaurant.status ?? 'pending'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700">
                          {restaurant.logo_url ? (
                            <img
                              src={restaurant.logo_url}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            initials(restaurant.name ?? 'Restaurant')
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {restaurant.name ?? 'Unnamed restaurant'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {restaurant.location ??
                              restaurant.address ??
                              'No location'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      {restaurant.owner?.name && (
                        <p>
                          Owner:{' '}
                          <span className="font-medium text-gray-800">
                            {restaurant.owner.name}
                          </span>
                        </p>
                      )}
                      {(restaurant.phone || restaurant.owner?.phone) && (
                        <p>
                          Phone:{' '}
                          <span className="font-medium text-gray-800">
                            {restaurant.phone ?? restaurant.owner?.phone}
                          </span>
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        Joined {formatDateTime(restaurant.created_at)}
                      </p>
                    </div>

                    {(restaurant.id_number ||
                      restaurant.id_front_url ||
                      restaurant.id_back_url) && (
                      <div className="mt-3 rounded-lg border border-gray-100 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          Verification documents
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {restaurant.id_number && (
                            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                              ID {restaurant.id_number}
                            </span>
                          )}
                          {[
                            { label: 'ID front', url: restaurant.id_front_url },
                            { label: 'ID back', url: restaurant.id_back_url },
                          ]
                            .filter((doc) => Boolean(doc.url))
                            .map((doc) => (
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
                          {!restaurant.documents_submitted_at && (
                            <span className="text-xs text-gray-400">
                              No submission date
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      {restaurant.status === 'pending' && (
                        <button
                          type="button"
                          disabled={busyId === restaurant.id}
                          onClick={() => void approve(restaurant.id)}
                          className="flex-1 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60"
                        >
                          Approve
                        </button>
                      )}
                      {restaurant.documents_submitted_at && (
                        <button
                          type="button"
                          disabled={busyId === restaurant.id}
                          onClick={() => void resetDocuments(restaurant.id)}
                          className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          Reset
                        </button>
                      )}
                      <select
                        aria-label="Restaurant status"
                        value={restaurant.status ?? ''}
                        disabled={busyId === restaurant.id}
                        onChange={(e) =>
                          void setRestaurantStatus(restaurant.id, e.target.value)
                        }
                        className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-purple-500 disabled:opacity-60"
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
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
