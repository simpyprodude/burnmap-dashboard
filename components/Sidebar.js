'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Sidebar({ profile, callCount = 0 }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const freePct = Math.min(100, Math.round((callCount / 50000) * 100))

  const sections = [
    {
      label: 'Overview',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: '▣' },
        { href: '/dashboard/runs', label: 'Runs', icon: '◈' },
      ]
    },
    {
      label: 'Manage',
      items: [
        { href: '/dashboard/projects', label: 'Projects', icon: '⬡' },
        { href: '/dashboard/settings', label: 'Settings', icon: '◎' },
      ]
    }
  ]

  return (
    <nav style={{
      background: 'var(--bg1)',
      borderRight: '1px solid var(--border)',
      padding: '20px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      minHeight: '100%',
    }}>
      {sections.map((section, si) => (
        <div key={si} style={{ padding: '0 16px', marginBottom: '8px' }}>
          <div style={{ fontSize: '10px', color: 'var(--muted2)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 8px', marginBottom: '4px' }}>
            {section.label}
          </div>
          {section.items.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '7px 8px',
                borderRadius: '4px',
                color: active ? 'var(--text)' : 'var(--muted)',
                fontSize: '12px',
                background: active ? 'var(--bg3)' : 'transparent',
                border: active ? '1px solid var(--border)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.12s',
                marginBottom: '2px',
              }}>
                <span style={{ fontSize: '14px', opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      ))}

      <div style={{ height: '1px', background: 'var(--border)', margin: '4px 16px 12px' }} />

      {/* Plan card */}
      <div style={{ marginTop: 'auto', padding: '0 16px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Current plan</div>
          <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '500', marginBottom: '10px', textTransform: 'capitalize' }}>
            {profile?.plan || 'free'} tier
          </div>
          <div style={{ height: '3px', background: 'var(--border2)', borderRadius: '2px', marginBottom: '6px' }}>
            <div style={{ height: '3px', background: 'var(--accent)', borderRadius: '2px', width: `${freePct}%` }} />
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
            {callCount.toLocaleString()} / 50,000 calls
          </div>
        </div>

        <button onClick={signOut} style={{
          marginTop: '12px',
          fontSize: '11px',
          color: 'var(--muted2)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          fontFamily: 'var(--mono)',
        }}>
          sign out →
        </button>
      </div>
    </nav>
  )
}
