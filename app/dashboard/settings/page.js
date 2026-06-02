import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ApiKeyDisplay from '@/components/ApiKeyDisplay'
import DeleteAccountModal from '@/components/DeleteAccountModal'
import UpgradeButton from '@/components/UpgradeButton'

export default async function SettingsPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const params = await searchParams
  const upgraded = params?.upgraded === 'true'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
      {/* Header */}
      <div>
        <div className="page-title">Settings</div>
        <div className="page-sub">API key, plan, and account details.</div>
      </div>

      {upgraded && (
        <div style={{ background: 'rgba(76,175,125,0.1)', border: '1px solid rgba(76,175,125,0.2)', borderRadius: '5px', padding: '12px 16px', fontSize: '12px', color: 'var(--green)' }}>
          Plan upgraded successfully. Welcome to {profile?.plan}!
        </div>
      )}

      {/* API Key */}
      <div className="settings-section">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="section-label" style={{ marginBottom: '4px' }}>API key</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Used to authenticate SDK calls from your agents. Store securely — we only keep a hash.
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

        {/* Current plan row */}
        <div className="settings-row">
          <div>
            <div className="settings-row-label" style={{ textTransform: 'capitalize' }}>
              {profile?.plan || 'free'}
            </div>
            <div className="settings-row-sub">
              {(!profile?.plan || profile.plan === 'free') && '50k calls/month · 30-day retention · 1 project'}
              {profile?.plan === 'indie' && 'Unlimited calls · 1-year retention · 5 projects'}
              {profile?.plan === 'team' && 'Unlimited calls · 1-year retention · unlimited projects · 3 seats'}
            </div>
          </div>
        </div>

        {/* Upgrade options — only for free users */}
        {(!profile?.plan || profile.plan === 'free') && (
          <div style={{ padding: '16px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <UpgradeButton plan="indie" label="Indie — $39/mo" sub="Unlimited calls · 5 projects" />
            <UpgradeButton plan="team"  label="Team — $99/mo"  sub="3 seats · unlimited projects" />
          </div>
        )}
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

      {/* Danger zone */}
      <div style={{ border: '1px solid rgba(232,92,92,0.3)', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(232,92,92,0.2)', background: 'rgba(232,92,92,0.05)' }}>
          <div style={{ fontSize: '9.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--red)' }}>
            Danger zone
          </div>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Delete account</div>
            <div className="settings-row-sub">
              Permanently delete your account, all runs, and all data. Cannot be undone.
            </div>
          </div>
          <DeleteAccountModal />
        </div>
      </div>
    </div>
  )
}

