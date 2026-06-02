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
  return '#555'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: runs }, { data: callRows }] = await Promise.all([
    supabase
      .from('runs')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(50),
    supabase
      .from('run_calls')
      .select('model, cost')
      .eq('user_id', user.id)
      .order('id', { ascending: false })
      .limit(5000),
  ])

  const totalSpent   = runs?.reduce((s, r) => s + Number(r.total_cost), 0) || 0
  const totalCalls   = runs?.reduce((s, r) => s + (r.call_count || 0), 0) || 0
  const totalRuns    = runs?.length || 0
  const avgCost      = totalRuns ? totalSpent / totalRuns : 0
  const stoppedEarly = runs?.filter(r => r.stopped_early).length || 0

  // Daily spend (last 30 days)
  const dailyMap = {}
  runs?.forEach(r => {
    const day = r.started_at?.slice(0, 10)
    if (day) dailyMap[day] = (dailyMap[day] || 0) + Number(r.total_cost)
  })
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, total]) => ({ day, total }))

  // Model breakdown (from parallel query above)
  const modelMap = {}
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
    { label: 'Total spend',    value: `$${totalSpent.toFixed(2)}`,             sub: `${totalRuns} run${totalRuns !== 1 ? 's' : ''}`,    accent: 'var(--accent)' },
    { label: 'Agent runs',     value: totalRuns,                                sub: `${stoppedEarly} stopped early`,                     accent: 'var(--green)' },
    { label: 'API calls',      value: totalCalls.toLocaleString(),              sub: totalRuns ? `avg ${Math.round(totalCalls / totalRuns)} / run` : '—', accent: 'var(--amber)' },
    { label: 'Avg cost / run', value: `$${avgCost.toFixed(3)}`,                 sub: 'per agent session',                                 accent: 'var(--blue)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title" style={{ fontFamily: 'var(--serif)' }}>Your burn, mapped.</div>
          <div className="page-sub">{totalCalls.toLocaleString()} calls tracked</div>
        </div>
        <Link href="/dashboard/runs" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
          View all runs →
        </Link>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-accent" style={{ background: s.accent }} />
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart + model breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-header-label">Spend over time</span>
            {dailyData.length > 0 && (
              <span style={{ fontSize: '10px', color: 'var(--muted2)' }}>last 30 days</span>
            )}
          </div>
          <div style={{ padding: '16px' }}>
            <SpendChart data={dailyData} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-header-label">By model</span>
          </div>
          <div style={{ padding: '8px 16px' }}>
            {models.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '11px' }}>
                No model data yet
              </div>
            ) : models.map(m => (
              <div key={m.model} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: modelColor(m.model), flexShrink: 0,
                }} />
                <div style={{ minWidth: '80px', overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {m.model.replace('claude-', '').replace(/-\d+[-.\d]*.*$/, '')}
                  </div>
                  <div style={{ fontSize: '9.5px', color: 'var(--muted2)' }}>
                    {m.model.includes('claude') ? 'anthropic' : 'openai'}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="budget-bar-track">
                    <div className="budget-bar-fill" style={{
                      width: `${Math.round((m.cost / maxModelCost) * 100)}%`,
                      background: modelColor(m.model),
                    }} />
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text)', minWidth: '46px', textAlign: 'right' }}>
                  ${m.cost.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent runs */}
      <div className="card">
        <div className="card-header">
          <span className="card-header-label">Recent runs</span>
          <Link href="/dashboard/runs" className="link">view all →</Link>
        </div>

        {!runs || runs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-title">No runs yet</div>
            <div className="empty-sub">
              Wrap your first agent session with{' '}
              <code style={{ color: 'var(--accent)', fontSize: '11px' }}>burnmap.run("name")</code>
            </div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Run name</th>
                <th>Status</th>
                <th>Cost</th>
                <th>Budget</th>
                <th>Calls</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {runs.slice(0, 10).map(run => {
                const pct = run.budget ? Math.min(100, Math.round((run.total_cost / run.budget) * 100)) : null
                const barColor = pct >= 100 ? 'var(--accent)' : pct >= 80 ? 'var(--amber)' : 'var(--green)'
                const sec = run.duration_seconds
                const durStr = sec ? (sec < 60 ? `${Number(sec).toFixed(0)}s` : `${Math.round(sec / 60)}m`) : '—'

                return (
                  <tr key={run.id}>
                    <td>
                      <Link href={`/dashboard/runs/${run.id}`} style={{ textDecoration: 'none' }}>
                        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{run.job_name}</span>
                        <div style={{ fontSize: '10px', color: 'var(--muted2)', marginTop: '1px' }}>
                          {new Date(run.started_at).toLocaleDateString()}
                        </div>
                      </Link>
                    </td>
                    <td>
                      {run.stopped_early
                        ? <span className="pill pill-red">exceeded</span>
                        : <span className="pill pill-green">completed</span>
                      }
                    </td>
                    <td style={{ color: run.stopped_early ? 'var(--accent)' : 'var(--text)', fontWeight: 500 }}>
                      ${Number(run.total_cost).toFixed(3)}
                    </td>
                    <td>
                      {pct !== null ? (
                        <div>
                          <div className="budget-bar-track" style={{ width: '64px', marginBottom: '3px' }}>
                            <div className="budget-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--muted2)' }}>
                            ${Number(run.total_cost).toFixed(2)} / ${Number(run.budget).toFixed(2)}
                          </div>
                        </div>
                      ) : <span style={{ color: 'var(--muted2)', fontSize: '11px' }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{run.call_count}</td>
                    <td style={{ color: 'var(--muted)' }}>{durStr}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
