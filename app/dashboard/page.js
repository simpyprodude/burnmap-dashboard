import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import SpendChart from '@/components/SpendChart'

const MODEL_COLORS = {
  'claude-opus':   '#e8593c',
  'claude-sonnet': '#d4943a',
  'claude-haiku':  '#4caf7d',
  'gpt-4o':        '#4a90d9',
  'gpt-4':         '#3470b8',
  'o1':            '#7b68d4',
  'o3':            '#7b68d4',
}

function modelColor(model) {
  for (const [key, color] of Object.entries(MODEL_COLORS)) {
    if (model.toLowerCase().includes(key)) return color
  }
  return '#666660'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: runs } = await supabase
    .from('runs')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(50)

  const totalSpent = runs?.reduce((s, r) => s + Number(r.total_cost), 0) || 0
  const totalCalls = runs?.reduce((s, r) => s + (r.call_count || 0), 0) || 0
  const totalRuns = runs?.length || 0
  const avgCost = totalRuns ? totalSpent / totalRuns : 0
  const stoppedEarly = runs?.filter(r => r.stopped_early).length || 0

  // Build daily spend data (last 30 days)
  const dailyMap = {}
  runs?.forEach(r => {
    const day = r.started_at?.slice(0, 10)
    if (day) dailyMap[day] = (dailyMap[day] || 0) + Number(r.total_cost)
  })
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, total]) => ({ day, total }))

  // Model breakdown
  const modelMap = {}
  const { data: callRows } = await supabase
    .from('run_calls')
    .select('model, cost')
    .in('run_id', (runs || []).map(r => r.id).slice(0, 50))
  callRows?.forEach(c => {
    if (!modelMap[c.model]) modelMap[c.model] = { cost: 0, calls: 0 }
    modelMap[c.model].cost += Number(c.cost)
    modelMap[c.model].calls++
  })
  const models = Object.entries(modelMap)
    .map(([model, d]) => ({ model, ...d }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5)
  const maxModelCost = models[0]?.cost || 1

  const stats = [
    { label: 'Total spend',   value: `$${totalSpent.toFixed(2)}`,  sub: `across ${totalRuns} runs`,             accent: 'var(--accent)' },
    { label: 'Agent runs',    value: totalRuns,                      sub: `${stoppedEarly} stopped early`,        accent: 'var(--green)' },
    { label: 'API calls',     value: totalCalls.toLocaleString(),    sub: totalRuns ? `avg ${Math.round(totalCalls / totalRuns)} / run` : 'no runs yet', accent: 'var(--amber)' },
    { label: 'Avg cost / run',value: `$${avgCost.toFixed(3)}`,       sub: 'per agent session',                   accent: 'var(--blue)' },
  ]

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px' }}>
            Your burn, mapped.
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
            Updated {now} · {totalCalls.toLocaleString()} calls tracked
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'var(--bg1)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '16px 18px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: s.accent }} />
            <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '26px', fontWeight: '300', color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: '6px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart + model breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>
        <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Spend over time</span>
          </div>
          <div style={{ padding: '18px' }}>
            <SpendChart data={dailyData} />
          </div>
        </div>

        <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>By model</span>
          </div>
          <div style={{ padding: '10px 18px' }}>
            {models.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '12px', padding: '8px 0' }}>No model data yet.</div>
            ) : models.map(m => (
              <div key={m.model} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ minWidth: '90px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.model.replace('claude-', '').replace(/-\d+-\d+.*$/, '').replace(/-\d+\.\d+.*$/, '')}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--muted2)' }}>
                    {m.model.includes('claude') ? 'anthropic' : 'openai'}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: '4px', background: 'var(--border2)', borderRadius: '2px' }}>
                    <div style={{ height: '4px', borderRadius: '2px', width: `${Math.round((m.cost / maxModelCost) * 100)}%`, background: modelColor(m.model) }} />
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text)', minWidth: '52px', textAlign: 'right' }}>${m.cost.toFixed(2)}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted2)', minWidth: '40px', textAlign: 'right' }}>{m.calls}c</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Runs table */}
      <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Recent runs</span>
          <Link href="/dashboard/runs" style={{ fontSize: '11px', color: 'var(--muted2)', textDecoration: 'none' }}>view all →</Link>
        </div>
        {!runs || runs.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
            No runs yet — wrap your first agent with <code style={{ color: 'var(--accent)' }}>burnmap.run("name")</code>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Run name', 'Status', 'Cost', 'Budget', 'Calls', 'Duration'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted2)', padding: '0 18px 10px', fontWeight: 400, borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.slice(0, 10).map(run => {
                const pct = run.budget ? Math.min(100, Math.round((run.total_cost / run.budget) * 100)) : null
                const barColor = pct >= 100 ? '#e8593c' : pct >= 80 ? '#d4943a' : '#4caf7d'
                const dur = run.duration_seconds ? (run.duration_seconds < 60 ? `${Number(run.duration_seconds).toFixed(0)}s` : `${Math.round(run.duration_seconds / 60)}m`) : '—'
                return (
                  <Link key={run.id} href={`/dashboard/runs/${run.id}`} style={{ display: 'contents' }}>
                    <tr style={{ cursor: 'pointer' }}>
                      <td style={{ padding: '11px 18px', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{run.job_name}</span>
                        <div style={{ fontSize: '10px', color: 'var(--muted2)', marginTop: '1px' }}>
                          {new Date(run.started_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ padding: '11px 18px', borderBottom: '1px solid var(--border)' }}>
                        {run.stopped_early
                          ? <span className="pill pill-red">exceeded</span>
                          : <span className="pill pill-green">completed</span>
                        }
                      </td>
                      <td style={{ padding: '11px 18px', fontSize: '12px', borderBottom: '1px solid var(--border)', color: run.stopped_early ? 'var(--accent)' : 'var(--text)', fontWeight: 500 }}>
                        ${Number(run.total_cost).toFixed(3)}
                      </td>
                      <td style={{ padding: '11px 18px', borderBottom: '1px solid var(--border)' }}>
                        {pct !== null ? (
                          <div>
                            <div style={{ width: '80px', height: '3px', background: 'var(--border2)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: '2px', width: `${pct}%`, background: barColor }} />
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--muted2)', marginTop: '2px' }}>
                              ${Number(run.total_cost).toFixed(2)} / ${Number(run.budget).toFixed(2)}
                            </div>
                          </div>
                        ) : <span style={{ color: 'var(--muted2)', fontSize: '11px' }}>no limit</span>}
                      </td>
                      <td style={{ padding: '11px 18px', fontSize: '12px', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>{run.call_count}</td>
                      <td style={{ padding: '11px 18px', fontSize: '12px', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>{dur}</td>
                    </tr>
                  </Link>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
