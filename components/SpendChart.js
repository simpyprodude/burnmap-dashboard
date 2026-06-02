'use client'
export default function SpendChart({ data = [] }) {
  if (!data.length) return (
    <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '12px' }}>
      no spend data yet
    </div>
  )

  const W = 600, H = 140
  const pad = { t: 10, r: 10, b: 30, l: 44 }
  const iW = W - pad.l - pad.r
  const iH = H - pad.t - pad.b
  const vals = data.map(d => d.total || 0)
  const maxV = Math.max(...vals, 0.001) * 1.15
  const x = i => pad.l + (i / Math.max(data.length - 1, 1)) * iW
  const y = v => pad.t + iH - (v / maxV) * iH

  const gridLines = [0, 0.25, 0.5, 0.75, 1]
  const step = Math.max(1, Math.ceil(data.length / 8))

  const linePath = data.length === 1
    ? null
    : `M${x(0)},${y(vals[0])} ` + data.map((d, i) => `L${x(i)},${y(d.total || 0)}`).join(' ')

  const areaPath = data.length === 1
    ? null
    : `M${x(0)},${y(vals[0])} ` +
      data.map((d, i) => `L${x(i)},${y(d.total || 0)}`).join(' ') +
      ` L${x(data.length - 1)},${pad.t + iH} L${x(0)},${pad.t + iH} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '140px' }}>
      {gridLines.map(frac => {
        const yy = pad.t + iH * (1 - frac)
        const label = (maxV * frac).toFixed(frac === 0 ? 0 : 2)
        return (
          <g key={frac}>
            <line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="#2a2a2a" strokeWidth="0.5" />
            <text x={pad.l - 6} y={yy + 4} textAnchor="end" fontSize="9" fill="#4a4a46" fontFamily="IBM Plex Mono">${label}</text>
          </g>
        )
      })}

      {areaPath && <path d={areaPath} fill="rgba(232,89,60,0.07)" />}
      {linePath && <path d={linePath} fill="none" stroke="#e8593c" strokeWidth="1.5" strokeLinejoin="round" />}

      {data.length === 1 && (
        <>
          <line x1={x(0)} y1={y(vals[0])} x2={x(0)} y2={pad.t + iH} stroke="rgba(232,89,60,0.15)" strokeWidth="1" />
          <circle cx={x(0)} cy={y(vals[0])} r="4" fill="#e8593c" />
        </>
      )}

      {data.length > 1 && (
        <circle cx={x(data.length - 1)} cy={y(vals[data.length - 1])} r="3.5" fill="#e8593c" />
      )}

      {data.map((d, i) => {
        if (i % step !== 0 && i !== data.length - 1) return null
        const label = d.day ? d.day.slice(5) : ''
        return (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#4a4a46" fontFamily="IBM Plex Mono">{label}</text>
        )
      })}
    </svg>
  )
}
