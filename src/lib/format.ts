export const ksh = (value: number | null | undefined) =>
  `KSh ${(Number(value) || 0).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

export const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString() : '—'

export const formatDateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString() : '—'

export const capitalize = (value?: string | null) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '—'

export const initials = (name?: string | null) => {
  const clean = (name ?? '').trim()
  if (!clean) return ''
  const parts = clean.split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
}
