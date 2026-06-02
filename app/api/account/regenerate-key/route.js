import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Generate a new raw key: bm_live_<32 random hex chars>
  const rawKey = `bm_live_${randomBytes(16).toString('hex')}`
  const keyHash = createHash('sha256').update(rawKey).digest('hex')

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ api_key_hash: keyHash })
    .eq('id', user.id)

  if (error) {
    console.error('Key regeneration error:', error)
    return NextResponse.json({ error: 'Failed to regenerate key' }, { status: 500 })
  }

  // Return raw key once — never stored
  return NextResponse.json({ key: rawKey })
}
