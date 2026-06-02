import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  // Verify cron secret
  const provided = request.headers.get('authorization') || ''
  const expected = `Bearer ${process.env.CRON_SECRET || ''}`
  if (
    !process.env.CRON_SECRET ||
    provided.length !== expected.length ||
    !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const results = { usersProcessed: 0, runsDeleted: 0, errors: 0 }

  const { data: freeUsers, error: usersError } = await supabase
    .from('profiles')
    .select('id')
    .or('plan.eq.free,plan.is.null')

  if (usersError) {
    console.error('Retention: failed to fetch free users:', usersError)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  for (const user of (freeUsers || [])) {
    try {
      const { data: oldRuns } = await supabase
        .from('runs')
        .select('id')
        .eq('user_id', user.id)
        .lt('started_at', thirtyDaysAgo)

      if (oldRuns?.length) {
        const ids = oldRuns.map(r => r.id)
        await supabase.from('run_calls').delete().in('run_id', ids)
        await supabase.from('runs').delete().in('id', ids)
        results.runsDeleted += ids.length
      }

      results.usersProcessed++
    } catch (err) {
      console.error(`Retention error for user ${user.id}:`, err)
      results.errors++
    }
  }

  console.log('Retention cron complete:', results)
  return NextResponse.json(results)
}
