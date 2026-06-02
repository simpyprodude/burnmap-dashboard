import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ApiKeyDisplay from '@/components/ApiKeyDisplay'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
      {/* Header */}
      <div>
        <div className="page-title">Settings</div>
        <div className="page-sub">API key, plan, and account details.</div>
      </div>

      {/* API Key */}
      <div className="settings-section">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="section-label" style={{ marginBottom: '4px' }}>API key</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Used to authenticate SDK calls from your agents.
          </div>
        </div>

        <div style={{ padding: '16px 20px' }}>
          <ApiKeyDisplay />

          <div className="code-block" style={{ marginTop: '14px' }}>
            <div style={{ color: 'var(--muted2)', marginBottom: '4px' }}>import burnmap</div>
            <div>
              <span style={{ color: 'var(--muted)' }}>burnmap.configure(</span>
              <span style={{ color: 'var(--accent)' }}>api_key</span>
              <span style={{ color: 'var(--muted)' }}>="</span>
              <span style={{ color: 'var(--text2)' }}>bm_live_…</span>
              <span style={{ color: 'var(--muted)' }}>")</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="settings-section">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="section-label">Plan</div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label" style={{ textTransform: 'capitalize' }}>
              {profile?.plan || 'free'}
            </div>
            <div className="settings-row-sub">
              {profile?.plan === 'free' && '50k calls/month · 30-day retention · 1 project'}
              {profile?.plan === 'indie' && 'Unlimited calls · 1-year retention · 5 projects · alerts'}
              {profile?.plan === 'team' && 'Unlimited calls · 1-year retention · unlimited projects · 3 seats'}
            </div>
          </div>
          {(!profile?.plan || profile.plan === 'free') && (
            <a
              href="https://burnmap.dev/#pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ fontSize: '11px', textDecoration: 'none' }}
            >
              Upgrade →
            </a>
          )}
        </div>
      </div>

      {/* Account */}
      <div className="settings-section">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="section-label">Account</div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">{user?.email}</div>
            <div className="settings-row-sub">
              Member since {new Date(user?.created_at).toLocaleDateString([], { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">User ID</div>
            <div className="settings-row-sub" style={{ fontFamily: 'var(--mono)' }}>{user?.id}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
