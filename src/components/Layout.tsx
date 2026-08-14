import type { ReactNode } from 'react'

export type PageId =
  | 'dashboard'
  | 'orders'
  | 'restaurants'
  | 'riders'
  | 'users'
  | 'earnings'

const nav: { id: PageId; label: string; icon: ReactNode }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    id: 'restaurants',
    label: 'Restaurants',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M3 11h18" />
        <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
        <path d="M8 7V4" />
        <path d="M12 7V4" />
        <path d="M16 7V4" />
      </svg>
    ),
  },
  {
    id: 'riders',
    label: 'Riders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M5 17h-2v-6l2-4h6v10" />
        <path d="M13 17h5" />
        <path d="M13 11h4l2 2v4h-6" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="16" cy="17" r="2" />
      </svg>
    ),
  },
  {
    id: 'users',
    label: 'Users',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <circle cx="9" cy="8" r="4" />
        <path d="M2 21a7 7 0 0 1 14 0" />
        <path d="M17 8a4 4 0 0 1 0 8" />
        <path d="M22 21a7 7 0 0 0-5-6.7" />
      </svg>
    ),
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    ),
  },
]

const titles: Record<PageId, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Platform overview and performance at a glance.',
  },
  orders: {
    title: 'Orders',
    subtitle: 'Track and manage every order on the platform.',
  },
  restaurants: {
    title: 'Restaurants',
    subtitle: 'Review, approve and monitor restaurant partners.',
  },
  riders: {
    title: 'Riders',
    subtitle: 'Manage riders, approvals and live availability.',
  },
  users: {
    title: 'Users',
    subtitle: 'All registered users and their platform roles.',
  },
  earnings: {
    title: 'Earnings',
    subtitle: 'Money flowing through the platform.',
  },
}

export function Layout({
  page,
  onNavigate,
  onLogout,
  children,
}: {
  page: PageId
  onNavigate: (page: PageId) => void
  onLogout: () => void
  children: ReactNode
}) {
  const { title, subtitle } = titles[page]

  return (
    <div className="flex min-h-svh bg-gray-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-slate-900 lg:flex">
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-white">
              <path d="M3 11h18" />
              <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
              <path d="M8 7V4" />
              <path d="M12 7V4" />
              <path d="M16 7V4" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-white">Fun n Dine</p>
            <p className="text-xs text-slate-400">Admin Console</p>
          </div>
        </div>
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active = item.id === page
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 lg:hidden"
              >
                Logout
              </button>
              <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700 sm:flex">
                A
              </div>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-gray-100 px-2 py-2 lg:hidden">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  item.id === page
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  )
}
