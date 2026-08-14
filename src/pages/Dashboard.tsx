import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { Badge, StatCard } from '../components/ui'
import { statusTone } from '../lib/status'
import { AreaChart, BarChart, DonutChart, DonutLegend } from '../components/Charts'
import { formatDateTime, ksh } from '../lib/format'

interface DashboardStats {
  users: number
  restaurants: number
  orders: number
  riders: number
}

interface StatusCount {
  status: string
  count: number
}

interface EarningsSummary {
  total_earned: number
  total_platform_fees: number
  this_week: number
  count: number
}

interface EarningsEntry {
  id: string
  amount: number
  platform_fee?: number
  status?: string
  type?: string
  created_at?: string
  order?: { order_number?: string; status?: string } | null
}

interface OrderRow {
  id: string
  order_number?: string
  restaurant?: { name?: string } | null
  total?: number
  status?: string
  payment_status?: string
  created_at?: string
  items?: unknown[]
}

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  accepted: '#3b82f6',
  preparing: '#a855f7',
  ready: '#10b981',
  picked_up: '#14b8a6',
  in_transit: '#14b8a6',
  arrived: '#22c55e',
  delivered: '#16a34a',
  cancelled: '#ef4444',
}

const buildTrend = (entries: EarningsEntry[]): { label: string; value: number }[] => {
  const days = 14
  const now = new Date()
  const points: { label: string; value: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now)
    day.setDate(now.getDate() - i)
    const key = day.toISOString().slice(0, 10)
    const total = entries
      .filter((entry) => entry.status === 'credited')
      .filter((entry) => (entry.created_at ?? '').slice(0, 10) === key)
      .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0)
    points.push({
      label: day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: Math.round(total),
    })
  }
  return points
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statuses, setStatuses] = useState<StatusCount[]>([])
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [trend, setTrend] = useState<{ label: string; value: number }[]>([])
  const [recent, setRecent] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    return Promise.all([
      apiFetch('/api/admin/dashboard').then(
        (res) => res.json() as Promise<{ data?: { dashboard?: DashboardStats } }>,
      ),
      apiFetch('/api/admin/analytics').then(
        (res) =>
          res.json() as Promise<{
            data?: { analytics?: { orderStatuses?: StatusCount[] } }
          }>,
      ),
      apiFetch('/api/earnings/summary').then(
        (res) =>
          res.json() as Promise<{
            data?: { summary?: EarningsSummary; entries?: EarningsEntry[] }
          }>,
      ),
      apiFetch('/api/orders').then(
        (res) => res.json() as Promise<{ data?: { orders?: OrderRow[] } }>,
      ),
    ])
      .then(([dashboardBody, analyticsBody, earningsBody, ordersBody]) => {
        setStats(dashboardBody.data?.dashboard ?? null)
        setStatuses(analyticsBody.data?.analytics?.orderStatuses ?? [])
        setSummary(earningsBody.data?.summary ?? null)
        setTrend(buildTrend(earningsBody.data?.entries ?? []))
        setRecent((ordersBody.data?.orders ?? []).slice(0, 8))
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const slices = statuses.map((s) => ({
    label: s.status,
    value: s.count,
    color: statusColors[s.status] ?? '#9ca3af',
  }))
  const totalOrders = statuses.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="space-y-6">
      {loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
          Loading dashboard...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
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
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total users"
              value={String(stats?.users ?? 0)}
              hint="Registered accounts"
              accent="#7c3aed"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <circle cx="9" cy="8" r="4" />
                  <path d="M2 21a7 7 0 0 1 14 0" />
                </svg>
              }
            />
            <StatCard
              label="Restaurants"
              value={String(stats?.restaurants ?? 0)}
              hint="Partner businesses"
              accent="#f59e0b"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M3 11h18" />
                  <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
                </svg>
              }
            />
            <StatCard
              label="Orders"
              value={String(stats?.orders ?? 0)}
              hint="All time"
              accent="#0ea5e9"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              }
            />
            <StatCard
              label="Riders"
              value={String(stats?.riders ?? 0)}
              hint="Registered delivery partners"
              accent="#10b981"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M5 17h-2v-6l2-4h6v10" />
                  <path d="M13 17h5" />
                  <path d="M13 11h4l2 2v4h-6" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="16" cy="17" r="2" />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Platform revenue
                  </h2>
                  <p className="text-sm text-gray-500">
                    Partner payouts across the last 14 days
                  </p>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  {ksh(summary?.total_earned)}
                </p>
              </div>
              <div className="mt-4">
                <AreaChart data={trend} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Order status
              </h2>
              <p className="text-sm text-gray-500">Current distribution</p>
              <div className="mt-4 flex flex-col items-center gap-4">
                <DonutChart
                  data={slices}
                  centerValue={String(totalOrders)}
                  centerLabel="orders"
                />
                <div className="w-full">
                  <DonutLegend data={slices} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Orders by status
              </h2>
              <p className="text-sm text-gray-500">Volume per pipeline stage</p>
              <div className="mt-4">
                <BarChart data={slices} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Earnings snapshot
              </h2>
              <p className="text-sm text-gray-500">Settled amounts</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-purple-50 p-4">
                  <p className="text-xs font-medium text-purple-600">
                    Total earned
                  </p>
                  <p className="mt-1 text-xl font-bold text-purple-900">
                    {ksh(summary?.total_earned)}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs font-medium text-amber-600">
                    Platform fees
                  </p>
                  <p className="mt-1 text-xl font-bold text-amber-900">
                    {ksh(summary?.total_platform_fees)}
                  </p>
                </div>
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-xs font-medium text-green-600">
                    Earned this week
                  </p>
                  <p className="mt-1 text-xl font-bold text-green-900">
                    {ksh(summary?.this_week)}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Settled entries
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {summary?.count ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent orders
            </h2>
            <p className="text-sm text-gray-500">Latest orders on the platform</p>
            {recent.length === 0 ? (
              <p className="mt-6 rounded-xl bg-gray-50 p-8 text-center text-sm text-gray-500">
                No orders yet.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                      <th className="py-2.5 pr-4 font-medium">Order</th>
                      <th className="py-2.5 pr-4 font-medium">Restaurant</th>
                      <th className="py-2.5 pr-4 font-medium">Status</th>
                      <th className="py-2.5 pr-4 font-medium">Payment</th>
                      <th className="py-2.5 pr-4 font-medium">Total</th>
                      <th className="py-2.5 font-medium">Placed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-3 pr-4 font-semibold text-gray-900">
                          {order.order_number ?? order.id.slice(0, 8)}
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {order.restaurant?.name ?? '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge tone={statusTone(order.status)}>
                            {order.status ?? 'pending'}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {order.payment_status ?? '—'}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-gray-900">
                          {ksh(order.total)}
                        </td>
                        <td className="py-3 text-gray-500">
                          {formatDateTime(order.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
