import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = user.id

  // Delete run_calls → runs → projects → profiles (in dependency order)
  const { data: runs } = await supabaseAdmin
    .from('runs')
    .select('id')
    .eq('user_id', userId)

  if (runs?.length) {
    const runIds = runs.map(r => r.id)
    await supabaseAdmin.from('run_calls').delete().in('run_id', runIds)
    await supabaseAdmin.from('runs').delete().in('id', runIds)
  }

  await supabaseAdmin.from('projects').delete().eq('user_id', userId)
  await supabaseAdmin.from('profiles').delete().eq('id', userId)

  // Delete the auth user — this also invalidates all sessions
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) {
    console.error('Auth user deletion error:', error)
    return NextResponse.json({ error: 'Account deletion failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
