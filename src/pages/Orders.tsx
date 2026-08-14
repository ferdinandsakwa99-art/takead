import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { Badge } from '../components/ui'
import { statusTone } from '../lib/status'
import { formatDateTime, ksh } from '../lib/format'

interface OrderRow {
  id: string
  order_number?: string
  restaurant?: { name?: string } | null
  rider?: { name?: string } | null
  total?: number
  status?: string
  payment_status?: string
  created_at?: string
  items?: unknown[]
}

const statusOptions = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'picked_up',
  'in_transit',
  'arrived',
  'delivered',
  'cancelled',
]

const paymentOptions = ['pending', 'paid', 'failed', 'refunded']

export default function Orders() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    return apiFetch('/api/orders')
      .then((res) => res.json() as Promise<{ data?: { orders?: OrderRow[] } }>)
      .then((body) => {
        setOrders(body.data?.orders ?? [])
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const updateOrder = async (order: OrderRow, field: 'status' | 'payment_status', value: string) => {
    setSavingId(order.id)
    setError(null)
    const body: Record<string, string> = {}
    if (field === 'status') body.status = value
    else body.payment_status = value

    await apiFetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
      .then((res) => res.json() as Promise<{ success?: boolean; error?: string }>)
      .then((result) => {
        if (result.success) {
          void load()
        } else {
          setError(result.error ?? 'Failed to update order')
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to update order')
      })
      .finally(() => setSavingId(null))
  }

  const visibleOrders = orders.filter(
    (order) =>
      (status === '' || order.status === status) &&
      (paymentStatus === '' || order.payment_status === paymentStatus),
  )

  const filters = [
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
          Orders
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage order statuses and payments across the platform.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatus('')}
          className={status === '' ? filterActive : filters}
        >
          All
        </button>
        {statusOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatus(option)}
            className={status === option ? filterActive : filters}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="self-center text-xs font-medium text-gray-400">
          Payment
        </span>
        {paymentOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPaymentStatus(option === paymentStatus ? '' : option)}
            className={paymentStatus === option ? filterActive : filters}
          >
            {option}
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
          Loading orders...
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
          {visibleOrders.length === 0 ? (
            <p className="rounded-xl bg-gray-50 p-8 text-center text-sm text-gray-500">
              No orders match the current filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                    <th className="py-2.5 pr-4 font-medium">Order</th>
                    <th className="py-2.5 pr-4 font-medium">Restaurant</th>
                    <th className="py-2.5 pr-4 font-medium">Rider</th>
                    <th className="py-2.5 pr-4 font-medium">Total</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                    <th className="py-2.5 pr-4 font-medium">Payment</th>
                    <th className="py-2.5 pr-4 font-medium">Placed</th>
                    <th className="py-2.5 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((order) => (
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
                      <td className="py-3 pr-4 text-gray-600">
                        {order.rider?.name ?? '—'}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-gray-900">
                        {ksh(order.total)}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={statusTone(order.status)}>
                          {order.status ?? 'pending'}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          tone={
                            order.payment_status === 'paid'
                              ? 'green'
                              : order.payment_status === 'failed' ||
                                  order.payment_status === 'refunded'
                                ? 'red'
                                : 'amber'
                          }
                        >
                          {order.payment_status ?? 'pending'}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">
                        {formatDateTime(order.created_at)}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <select
                            aria-label="Order status"
                            value={order.status ?? ''}
                            disabled={savingId === order.id}
                            onChange={(e) =>
                              void updateOrder(order, 'status', e.target.value)
                            }
                            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 outline-none transition focus:border-purple-500"
                          >
                            {statusOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <select
                            aria-label="Payment status"
                            value={order.payment_status ?? ''}
                            disabled={savingId === order.id}
                            onChange={(e) =>
                              void updateOrder(
                                order,
                                'payment_status',
                                e.target.value,
                              )
                            }
                            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 outline-none transition focus:border-purple-500"
                          >
                            {paymentOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
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
