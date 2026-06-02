'use client'

export default function UpgradeButton({ plan, label, sub }) {
  return (
    <form action="/api/stripe/checkout" method="POST" style={{ flex: '1', minWidth: '180px' }}>
      <input type="hidden" name="plan" value={plan} />
      <button
        type="submit"
        style={{
          width: '100%',
          background: 'var(--bg)',
          border: '1px solid var(--border2)',
          borderRadius: '5px',
          padding: '12px 14px',
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: 'var(--mono)',
          transition: 'border-color 0.15s, background 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.background = 'rgba(232,89,60,0.04)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border2)'
          e.currentTarget.style.background = 'var(--bg)'
        }}
      >
        <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500, marginBottom: '3px' }}>{label}</div>
        <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{sub}</div>
      </button>
    </form>
  )
}
