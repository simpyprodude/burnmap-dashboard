import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, plan, api_key')
    .eq('id', user.id)
    .single()

  const { count } = await supabase
    .from('runs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const callCount = count || 0

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '220px 1fr',
      gridTemplateRows: '48px 1fr',
      minHeight: '100vh',
    }}>
      <Topbar profile={profile} />
      <Sidebar profile={profile} callCount={callCount} />
      <main style={{ overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {children}
        <footer style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px', display: 'flex', gap: '16px' }}>
          <a href="/legal/terms" style={{ fontSize: '10px', color: 'var(--muted2)' }}>Terms</a>
          <a href="/legal/privacy" style={{ fontSize: '10px', color: 'var(--muted2)' }}>Privacy</a>
          <a href="mailto:remon@burnmap.dev" style={{ fontSize: '10px', color: 'var(--muted2)' }}>remon@burnmap.dev</a>
        </footer>
      </main>
    </div>
  )
}
