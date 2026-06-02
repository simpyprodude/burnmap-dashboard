'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const NAV = [
  {
    label: 'Overview',
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
        ),
      },
      {
        href: '/dashboard/runs',
        label: 'Runs',
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4h10M2 7h7M2 10h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Manage',
    items: [
      {
        href: '/dashboard/projects',
        label: 'Projects',
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 4.5h12M1 4.5V11a1 1 0 001 1h10a1 1 0 001-1V4.5M1 4.5V3a1 1 0 011-1h3l1 1.5h6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        ),
      },
      {
        href: '/dashboard/settings',
        label: 'Settings',
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.46 2.46l1.06 1.06M10.48 10.48l1.06 1.06M2.46 11.54l1.06-1.06M10.48 3.52l1.06-1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        ),
      },
    ],
  },
]

export default function Sidebar({ profile, callCount = 0 }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href) => href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
  const isPaid = profile?.plan && profile.plan !== 'free'
  const freePct = isPaid ? 100 : Math.min(100, Math.round((callCount / 50000) * 100))

  return (
    <nav style={{
      background: 'var(--bg1)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      paddingBottom: '16px',
    }}>
      <div style={{ flex: 1, padding: '12px 12px 0' }}>
        {NAV.map((section, si) => (
          <div key={si} style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '9.5px',
              color: 'var(--muted2)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '0 8px',
              marginBottom: '4px',
            }}>
              {section.label}
            </div>

            {section.items.map(item => {
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '7px 8px',
                  borderRadius: '4px',
                  color: active ? 'var(--text)' : 'var(--muted)',
                  fontSize: '12px',
                  background: active ? 'var(--bg3)' : 'transparent',
                  border: active ? '1px solid var(--border2)' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.12s',
                  marginBottom: '2px',
                  borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                  paddingLeft: active ? '7px' : '7px',
                }}>
                  <span style={{ color: active ? 'var(--accent)' : 'var(--muted2)', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div style={{ padding: '0 12px' }}>
        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '12px' }} />

        {/* Plan usage */}
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '5px',
          padding: '12px',
          marginBottom: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'capitalize' }}>
              {profile?.plan || 'free'} plan
            </span>
            {!isPaid && (
              <span style={{ fontSize: '9.5px', color: 'var(--muted2)' }}>
                {freePct}%
              </span>
            )}
          </div>

          {!isPaid && (
            <>
              <div className="budget-bar-track" style={{ marginBottom: '6px' }}>
                <div className="budget-bar-fill" style={{
                  width: `${freePct}%`,
                  background: freePct >= 90 ? 'var(--accent)' : freePct >= 70 ? 'var(--amber)' : 'var(--green)',
                }} />
              </div>
              <div style={{ fontSize: '9.5px', color: 'var(--muted2)' }}>
                {callCount.toLocaleString()} / 50,000 calls
              </div>
            </>
          )}

          {isPaid && (
            <div style={{ fontSize: '9.5px', color: 'var(--green)' }}>
              unlimited calls
            </div>
          )}
        </div>

        <button onClick={signOut} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          color: 'var(--muted2)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '5px 8px',
          borderRadius: '4px',
          fontFamily: 'var(--mono)',
          width: '100%',
          transition: 'color 0.15s, background 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg3)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted2)'; e.currentTarget.style.background = 'none'; }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 6H10M8 4l2 2-2 2M7 2.5H2.5A.5.5 0 002 3v6a.5.5 0 00.5.5H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          sign out
        </button>
      </div>
    </nav>
  )
}
