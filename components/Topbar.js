'use client'
export default function Topbar({ profile }) {
  return (
    <header style={{
      gridColumn: '1 / -1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px 0 0',
      height: '48px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg1)',
    }}>
      {/* Wordmark — spans sidebar width */}
      <div style={{
        width: '220px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 20px',
        borderRight: '1px solid var(--border)',
        height: '100%',
        flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="14" height="14" rx="3" stroke="var(--accent)" strokeWidth="1.5"/>
          <path d="M4 11 L8 5 L12 11" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--text)',
          letterSpacing: '-0.01em',
        }}>burnmap</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Plan badge */}
        <div style={{
          fontSize: '10px',
          color: 'var(--muted)',
          background: 'var(--bg3)',
          border: '1px solid var(--border2)',
          padding: '3px 9px',
          borderRadius: '3px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {profile?.plan || 'free'}
        </div>

        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--muted)' }}>
          <span style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: 'var(--green)',
            display: 'inline-block',
            animation: 'pulse 2.4s ease-in-out infinite',
            flexShrink: 0,
          }} />
          live
        </div>

        {/* Email */}
        <div style={{ fontSize: '10px', color: 'var(--muted2)' }}>
          {profile?.email}
        </div>
      </div>
    </header>
  )
}
