import { supabase } from './supabase'

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'https://takead.vercel.app'
).replace(/\/$/, '')

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers)

  if (
    !headers.has('Content-Type') &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json')
  }

  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    throw new Error(`API request failed (${res.status})`)
  }

  return res
}
