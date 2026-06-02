import { createClient } from '@/lib/supabase-server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <div className="mb-8">
        <h1 className="serif text-3xl text-[#E8E8E6] mb-1">settings</h1>
        <p className="text-[#6B7070] text-xs">your account and API key.</p>
      </div>

      {/* API Key */}
      <div className="border border-[#1E2424] bg-[#111414] p-6 mb-4">
        <div className="text-[10px] text-[#6B7070] uppercase tracking-wider mb-3">api key</div>
        <code className="text-[#FA3C14] text-xs break-all">
          {profile?.api_key
            ? profile.api_key.slice(0, 7) + '•'.repeat(Math.max(0, profile.api_key.length - 15)) + profile.api_key.slice(-8)
            : '—'}
        </code>
        <p className="text-[#6B7070] text-[11px] mt-3">
          use this in your SDK config to send run data to burnmap.
        </p>
        <div className="mt-4 bg-[#0D0F0F] border border-[#1E2424] p-4">
          <code className="text-[#9AA0A0] text-xs block">
            {'import burnmap'}
          </code>
          <code className="text-[#9AA0A0] text-xs block mt-1">
            {'burnmap.configure(api_key="bm_live_...")  # copy from above'}
          </code>
        </div>
      </div>

      {/* Plan */}
      <div className="border border-[#1E2424] bg-[#111414] p-6 mb-4">
        <div className="text-[10px] text-[#6B7070] uppercase tracking-wider mb-3">plan</div>
        <div className="flex items-center justify-between">
          <span className="text-[#E8E8E6] text-sm capitalize">{profile?.plan || 'free'}</span>
          {profile?.plan === 'free' && (
            <a
              href="https://burnmap.dev/#pricing"
              target="_blank"
              className="text-xs text-[#FA3C14] hover:underline"
            >
              upgrade →
            </a>
          )}
        </div>
        <div className="mt-3 text-[#6B7070] text-xs">
          {profile?.plan === 'free' && '50k calls/month · 30-day retention · 1 project'}
          {profile?.plan === 'indie' && 'unlimited calls · 1-year retention · 5 projects · alerts'}
          {profile?.plan === 'team' && 'unlimited calls · 1-year retention · unlimited projects · 3 seats'}
        </div>
      </div>

      {/* Account */}
      <div className="border border-[#1E2424] bg-[#111414] p-6">
        <div className="text-[10px] text-[#6B7070] uppercase tracking-wider mb-3">account</div>
        <p className="text-[#E8E8E6] text-sm">{user?.email}</p>
        <p className="text-[#6B7070] text-xs mt-1">
          member since {new Date(user?.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
