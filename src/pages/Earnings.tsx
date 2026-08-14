import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { Badge, StatCard } from '../components/ui'
import { statusTone } from '../lib/status'
import { formatDateTime, ksh } from '../lib/format'

interface EarningsSummary {
  total_earned: number
  total_platform_fees: number
  this_week: number
  count: number
}

interface PlatformWallet {
  id: string
  balance: number
  currency?: string
}

interface EarningsEntry {
  id: string
  amount: number
  platform_fee?: number
  status?: string
  type?: string
  description?: string
  created_at?: string
  earnings_date?: string
  order?: { order_number?: string } | null
}

const statusOptions = ['credited', 'collected']

export default function Earnings() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [wallet, setWallet] = useState<PlatformWallet | null>(null)
  const [entries, setEntries] = useState<EarningsEntry[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    return apiFetch('/api/earnings/summary')
      .then(
        (res) =>
          res.json() as Promise<{
            data?: {
              summary?: EarningsSummary
              wallet?: PlatformWallet
              entries?: EarningsEntry[]
            }
          }>,
      )
      .then((body) => {
        setSummary(body.data?.summary ?? null)
        setWallet(body.data?.wallet ?? null)
        setEntries(body.data?.entries ?? [])
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load earnings')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const visibleEntries = entries.filter(
    (entry) => status === '' || entry.status === status,
  )

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
          Earnings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Partner settlements and platform revenue.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Platform balance"
          value={ksh(wallet?.balance)}
          hint="Fees held in the platform wallet"
          accent="#7c3aed"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
              <circle cx="12" cy="15" r="2" />
            </svg>
          }
        />
        <StatCard
          label="Total earned"
          value={ksh(summary?.total_earned)}
          hint="Credited to partners"
          accent="#7c3aed"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12" />
              <path d="M15 9.5c0-1.5-1.3-2.5-3-2.5s-3 1-3 2.5 1.3 2.5 3 2.5 3 1 3 2.5-1.3 2.5-3 2.5-3-1-3-2.5" />
            </svg>
          }
        />
        <StatCard
          label="Platform fees"
          value={ksh(summary?.total_platform_fees)}
          hint="Commission collected"
          accent="#f59e0b"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M3 21V8l9-5 9 5v13" />
              <path d="M7 21v-8" />
              <path d="M12 21v-9" />
              <path d="M17 21v-8" />
            </svg>
          }
        />
        <StatCard
          label="This week"
          value={ksh(summary?.this_week)}
          hint="Last 7 days"
          accent="#10b981"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </svg>
          }
        />
        <StatCard
          label="Settled entries"
          value={String(summary?.count ?? 0)}
          hint="Payout records"
          accent="#0ea5e9"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          }
        />
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
          Loading earnings...
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
          <h2 className="text-lg font-semibold text-gray-900">
            Settlement records
          </h2>
          <p className="text-sm text-gray-500">
            Partner earnings from completed deliveries
          </p>
          {visibleEntries.length === 0 ? (
            <p className="mt-6 rounded-xl bg-gray-50 p-8 text-center text-sm text-gray-500">
              No settlement records yet.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                    <th className="py-2.5 pr-4 font-medium">Description</th>
                    <th className="py-2.5 pr-4 font-medium">Order</th>
                    <th className="py-2.5 pr-4 font-medium">Amount</th>
                    <th className="py-2.5 pr-4 font-medium">Platform fee</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                    <th className="py-2.5 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-3 pr-4 text-gray-900">
                        {entry.description ?? entry.type ?? 'Settlement'}
                      </td>
                      <td className="py-3 pr-4 font-medium text-gray-700">
                        {entry.order?.order_number ?? '—'}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-gray-900">
                        {ksh(entry.amount)}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {ksh(entry.platform_fee)}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={statusTone(entry.status)}>
                          {entry.status ?? 'pending'}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500">
                        {formatDateTime(entry.created_at ?? entry.earnings_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
