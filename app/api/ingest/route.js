import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── Rate limiting (in-memory, 60 req/min per key hash) ──────────────────────
const rateLimitMap = new Map()
const WINDOW_MS = 60_000
const MAX_REQUESTS = 60

function isRateLimited(keyHash) {
  const now = Date.now()
  const timestamps = (rateLimitMap.get(keyHash) || []).filter(t => now - t < WINDOW_MS)
  if (timestamps.length >= MAX_REQUESTS) return true
  rateLimitMap.set(keyHash, [...timestamps, now])
  return false
}

// ── Free-tier monthly call count ─────────────────────────────────────────────
async function getMonthlyCallCount(userId) {
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { data: runs } = await supabase
    .from('runs')
    .select('call_count')
    .eq('user_id', userId)
    .gte('started_at', monthStart.toISOString())

  return runs?.reduce((s, r) => s + (r.call_count || 0), 0) || 0
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
    }
    const apiKey = authHeader.replace('Bearer ', '').trim()
    const keyHash = createHash('sha256').update(apiKey).digest('hex')

    // ── Rate limit check ────────────────────────────────────────────────────
    if (isRateLimited(keyHash)) {
      return NextResponse.json({ error: 'Rate limit exceeded (60 req/min)' }, { status: 429 })
    }

    // ── Authenticate via hashed key ─────────────────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, plan')
      .eq('api_key_hash', keyHash)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const body = await request.json()
    const {
      job_name, budget, total_cost, call_count,
      duration_seconds, stopped_early, stop_reason,
      calls, project_id, started_at, ended_at,
    } = body

    if (!job_name || typeof job_name !== 'string' || job_name.trim().length === 0) {
      return NextResponse.json({ error: 'job_name is required' }, { status: 400 })
    }

    // ── Free-tier enforcement ───────────────────────────────────────────────
    if (!profile.plan || profile.plan === 'free') {
      const monthlyCount = await getMonthlyCallCount(profile.id)
      if (monthlyCount >= 50000) {
        return NextResponse.json({
          error: 'Free tier limit reached (50k calls/month). Upgrade at dashboard.burnmap.dev/dashboard/settings',
        }, { status: 429 })
      }

      const { count: projectCount } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
      if (project_id && projectCount >= 1) {
        // Allow ingest without a project_id, but cap project association
      }
    }

    // ── Validate project_id ownership (IDOR guard) ──────────────────────────
    let resolvedProjectId = null
    if (project_id) {
      const { data: proj } = await supabase
        .from('projects')
        .select('id')
        .eq('id', project_id)
        .eq('user_id', profile.id)
        .single()
      if (!proj) {
        return NextResponse.json({ error: 'Invalid project_id' }, { status: 403 })
      }
      resolvedProjectId = proj.id
    }

    const safeCalls = Array.isArray(calls) ? calls.slice(0, 10000) : []

    // ── Insert run ──────────────────────────────────────────────────────────
    const { data: run, error: runError } = await supabase
      .from('runs')
      .insert({
        user_id: profile.id,
        project_id: resolvedProjectId,
        job_name: job_name.trim(),
        budget,
        total_cost,
        call_count,
        duration_seconds,
        stopped_early: stopped_early || false,
        stop_reason: stop_reason || null,
        started_at: started_at || new Date().toISOString(),
        ended_at: ended_at || new Date().toISOString(),
      })
      .select('id, share_token')
      .single()

    if (runError) {
      console.error('Run insert error:', runError)
      return NextResponse.json({ error: 'Failed to save run' }, { status: 500 })
    }

    // ── Insert call records ─────────────────────────────────────────────────
    if (safeCalls.length > 0) {
      const callRows = safeCalls.map(c => ({
        run_id: run.id,
        call_number: c.call_number,
        model: c.model,
        input_tokens: c.input_tokens,
        output_tokens: c.output_tokens,
        cost: c.cost,
        cumulative_cost: c.cumulative_cost,
      }))
      await supabase.from('run_calls').insert(callRows)
    }

    return NextResponse.json({
      ok: true,
      run_id: run.id,
      share_url: `https://dashboard.burnmap.dev/runs/${run.share_token}`,
    })
  } catch (err) {
    console.error('Ingest error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
