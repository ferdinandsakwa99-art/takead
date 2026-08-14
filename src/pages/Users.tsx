import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { Badge } from '../components/ui'
import { formatDateTime } from '../lib/format'

interface UserRow {
  id: string
  name?: string
  email?: string
  phone?: string
  role?: { name?: string; slug?: string } | null
  role_id?: string
  created_at?: string
}

const roleSlugs = ['CUSTOMER', 'RESTAURANT_OWNER', 'RIDER', 'ADMIN']

const roleTone = (
  slug: string | undefined,
): 'gray' | 'green' | 'red' | 'amber' | 'purple' | 'blue' | 'teal' => {
  switch (slug) {
    case 'ADMIN':
      return 'purple'
    case 'RESTAURANT':
      return 'amber'
    case 'RIDER':
      return 'teal'
    case 'CUSTOMER':
      return 'blue'
    default:
      return 'gray'
  }
}

export default function Users() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    return apiFetch('/api/users')
      .then((res) => res.json() as Promise<{ data?: { users?: UserRow[] } }>)
      .then((body) => {
        setUsers(body.data?.users ?? [])
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load users')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const userRoleSlug = (user: UserRow) => user.role?.slug ?? 'CUSTOMER'

  const visibleUsers = users.filter(
    (user) => role === '' || userRoleSlug(user) === role,
  )

  const changeRole = async (user: UserRow, next: string) => {
    setBusyId(user.id)
    setError(null)
    await apiFetch(`/api/admin/users/${user.id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: next }),
    })
      .then((res) => res.json() as Promise<{ success?: boolean; error?: string }>)
      .then((result) => {
        if (result.success) {
          void load()
        } else {
          setError(result.error ?? 'Failed to update role')
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to update role')
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
          Users
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Accounts across the platform and their roles.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRole('')}
          className={role === '' ? filterActive : filterBase}
        >
          All
        </button>
        {roleSlugs.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setRole(option)}
            className={role === option ? filterActive : filterBase}
          >
            {option}
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
          Loading users...
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
          {visibleUsers.length === 0 ? (
            <p className="rounded-xl bg-gray-50 p-8 text-center text-sm text-gray-500">
              No users match the current filter.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                    <th className="py-2.5 pr-4 font-medium">Name</th>
                    <th className="py-2.5 pr-4 font-medium">Email</th>
                    <th className="py-2.5 pr-4 font-medium">Phone</th>
                    <th className="py-2.5 pr-4 font-medium">Role</th>
                    <th className="py-2.5 pr-4 font-medium">Joined</th>
                    <th className="py-2.5 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((user) => {
                    const current = userRoleSlug(user)
                    return (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-3 pr-4 font-semibold text-gray-900">
                          {user.name ?? 'Unnamed'}
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {user.email ?? '—'}
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {user.phone ?? '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge tone={roleTone(current)}>{current}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-gray-500">
                          {formatDateTime(user.created_at)}
                        </td>
                        <td className="py-3">
                          <select
                            aria-label="User role"
                            value={current}
                            disabled={busyId === user.id}
                            onChange={(e) =>
                              void changeRole(user, e.target.value)
                            }
                            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 outline-none transition focus:border-purple-500 disabled:opacity-60"
                          >
                            {roleSlugs.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
