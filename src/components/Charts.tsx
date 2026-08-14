interface Slice {
  label: string
  value: number
  color: string
}

interface Point {
  label: string
  value: number
}

export function DonutChart({
  data,
  size = 200,
  thickness = 26,
  centerLabel,
  centerValue,
}: {
  data: Slice[]
  size?: number
  thickness?: number
  centerLabel?: string
  centerValue?: string
}) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={thickness}
        />
        {total > 0 &&
          data.map((slice) => {
            const fraction = slice.value / total
            const dash = fraction * circumference
            const element = (
              <circle
                key={slice.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            )
            offset += dash
            return element
          })}
      </svg>
      <div className="absolute text-center">
        {centerValue && (
          <p className="text-2xl font-bold text-gray-900">{centerValue}</p>
        )}
        {centerLabel && (
          <p className="text-xs text-gray-500">{centerLabel}</p>
        )}
      </div>
    </div>
  )
}

export function DonutLegend({ data }: { data: Slice[] }) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0)
  return (
    <ul className="space-y-2">
      {data.map((slice) => (
        <li key={slice.label} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: slice.color }}
          />
          <span className="flex-1 text-gray-600">{slice.label}</span>
          <span className="font-semibold text-gray-900">{slice.value}</span>
          <span className="w-10 text-right text-gray-400">
            {total > 0 ? Math.round((slice.value / total) * 100) : 0}%
          </span>
        </li>
      ))}
    </ul>
  )
}

export function BarChart({
  data,
  height = 220,
  color = '#7c3aed',
}: {
  data: Point[]
  height?: number
  color?: string
}) {
  const width = 640
  const padX = 14
  const top = 14
  const bottom = height - 30
  const max = Math.max(...data.map((d) => d.value), 1)
  const innerW = width - padX * 2
  const slot = innerW / Math.max(data.length, 1)
  const barWidth = Math.min(46, slot * 0.5)

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = bottom - (bottom - top) * f
        return (
          <line
            key={f}
            x1={padX}
            x2={width - padX}
            y1={y}
            y2={y}
            stroke="#f3f4f6"
            strokeWidth={1}
          />
        )
      })}
      {data.map((d, i) => {
        const barHeight = (d.value / max) * (bottom - top)
        const x = padX + i * slot + (slot - barWidth) / 2
        const y = bottom - barHeight
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 2)}
              rx={6}
              fill={color}
            />
            <text
              x={x + barWidth / 2}
              y={bottom + 16}
              textAnchor="middle"
              fontSize={10}
              fill="#6b7280"
            >
              {d.label}
            </text>
            <text
              x={x + barWidth / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              fill="#374151"
            >
              {d.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function AreaChart({
  data,
  height = 240,
  color = '#7c3aed',
}: {
  data: Point[]
  height?: number
  color?: string
}) {
  const width = 640
  const padX = 12
  const top = 16
  const bottom = height - 28
  const values = data.map((d) => d.value)
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const innerH = bottom - top
  const step = (width - padX * 2) / Math.max(data.length - 1, 1)

  const points = data.map((d, i) => ({
    x: padX + i * step,
    y: bottom - ((d.value - min) / range) * innerH,
  }))
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x.toFixed(1)},${bottom} L${points[0].x.toFixed(1)},${bottom} Z`
      : ''

  const ticks = (() => {
    const stepValue = Math.ceil(range / 4 / 10) * 10 || 1
    const out: number[] = []
    for (let v = min; v <= max + stepValue / 2; v += stepValue) {
      out.push(Math.round(v))
    }
    return out.length > 1 ? out : [min, max]
  })()

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {ticks.map((t) => {
        const y = bottom - ((t - min) / range) * innerH
        return (
          <g key={t}>
            <line
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="#f3f4f6"
              strokeWidth={1}
            />
            <text
              x={width - padX}
              y={y - 4}
              textAnchor="end"
              fontSize={9}
              fill="#9ca3af"
            >
              {t}
            </text>
          </g>
        )
      })}
      {areaPath && <path d={areaPath} fill="url(#areaFill)" />}
      {points.map((p, i) => (
        <g key={i}>
          <line
            x1={p.x}
            x2={p.x}
            y1={bottom}
            y2={p.y}
            stroke={color}
            strokeWidth={i === points.length - 1 ? 1.5 : 0.6}
            opacity={i === points.length - 1 ? 0.6 : 0.15}
          />
          {i === points.length - 1 && (
            <circle cx={p.x} cy={p.y} r={4} fill={color} />
          )}
        </g>
      ))}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => (
        <text
          key={d.label}
          x={padX + i * step}
          y={height - 8}
          textAnchor="middle"
          fontSize={9}
          fill="#6b7280"
        >
          {d.label}
        </text>
      ))}
    </svg>
  )
}
