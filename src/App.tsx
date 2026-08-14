import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabase'
import { Layout } from './components/Layout'
import type { PageId } from './components/Layout'
import { adminLogout } from './lib/auth'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Restaurants from './pages/Restaurants'
import Riders from './pages/Riders'
import Users from './pages/Users'
import Earnings from './pages/Earnings'
import Login from './pages/Login'

type Status = 'loading' | 'unauthenticated' | 'nonadmin' | 'admin'

const pages: Record<PageId, React.ReactNode> = {
  dashboard: <Dashboard />,
  orders: <Orders />,
  restaurants: <Restaurants />,
  riders: <Riders />,
  users: <Users />,
  earnings: <Earnings />,
}

function App() {
  const [status, setStatus] = useState<Status>('loading')
  const [page, setPage] = useState<PageId>('dashboard')
  const [notice, setNotice] = useState<string | null>(null)

  const checkSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    const session = data.session

    if (!session) {
      setStatus('unauthenticated')
      return
    }

    const userId = session.user.id

    const { data: profile, error } = await supabase
      .from('users')
      .select('roles!inner(slug)')
      .eq('id', userId)
      .maybeSingle()

    const roles = profile?.roles
    const roleSlug =
      roles?.[0]?.slug ?? (session.user.user_metadata?.role as string | undefined)

    if (!error && roleSlug) {
      if (roleSlug === 'ADMIN') {
        setStatus('admin')
        return
      }
      setStatus('nonadmin')
      setNotice('This account is not an administrator. Access is restricted.')
      return
    }

    const metaRole = session.user.user_metadata?.role as string | undefined
    if (metaRole === 'ADMIN') {
      setStatus('admin')
      return
    }
    setStatus('nonadmin')
    setNotice('This account is not an administrator. Access is restricted.')
  }, [])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'SIGNED_OUT'
      ) {
        void checkSession()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [checkSession])

  const handleLogout = useCallback(() => {
    void adminLogout().then(() => {
      setStatus('unauthenticated')
      setNotice(null)
    })
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    )
  }

  if (status !== 'admin') {
    return <Login onSuccess={() => void checkSession()} notice={notice} />
  }

  return (
    <Layout page={page} onNavigate={setPage} onLogout={handleLogout}>
      {pages[page]}
    </Layout>
  )
}

export default App
