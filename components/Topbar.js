'use client'
export default function Topbar({ profile }) {
  return (
    <header style={{
      gridColumn: '1 / -1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: '48px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Burnmap
        </span>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', marginBottom: '2px' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--muted)', border: '1px solid var(--border2)', padding: '3px 10px', borderRadius: '3px' }}>
          plan: <span style={{ color: 'var(--text)' }}>{profile?.plan || 'free'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--muted)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
          live
        </div>
      </div>
    </header>
  )
}
