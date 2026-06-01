import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
    }
    const apiKey = authHeader.replace('Bearer ', '').trim()

    // Look up user by API key
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, plan')
      .eq('api_key', apiKey)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const body = await request.json()
    const { job_name, budget, total_cost, call_count, duration_seconds, stopped_early, stop_reason, calls, project_id, started_at, ended_at } = body

    // Insert the run
    const { data: run, error: runError } = await supabase
      .from('runs')
      .insert({
        user_id: profile.id,
        project_id: project_id || null,
        job_name,
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

    // Insert individual calls
    if (calls && calls.length > 0) {
      const callRows = calls.map(c => ({
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
