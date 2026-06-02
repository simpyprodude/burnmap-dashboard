import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CopyShareLink from '@/components/CopyShareLink'

export default async function RunPage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: run } = await supabase
    .from('runs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!run) notFound()

  const { data: calls } = await supabase
    .from('run_calls')
    .select('*')
    .eq('run_id', id)
    .order('call_number', { ascending: true })

  const pct = run.budget ? Math.min(100, (run.total_cost / run.budget) * 100) : null
  const barColor = pct >= 100 ? 'var(--accent)' : pct >= 80 ? 'var(--amber)' : 'var(--green)'

  function dur(s) {
    if (!s) return '—'
    if (s < 60) return `${Number(s).toFixed(1)}s`
    if (s < 3600) return `${(s / 60).toFixed(1)}m`
    return `${(s / 3600).toFixed(2)}h`
  }

  const avgCostPerCall = run.call_count ? run.total_cost / run.call_count : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Breadcrumb + title */}
      <div>
        <Link href="/dashboard/runs" className="link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M6 2L3 5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Runs
        </Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div className="page-title">{run.job_name}</div>
            <div className="page-sub">
              {new Date(run.started_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              {run.duration_seconds && ` · ${dur(run.duration_seconds)}`}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            {run.stopped_early
              ? <span className="pill pill-red">budget exceeded</span>
              : <span className="pill pill-green">completed</span>
            }
            {run.share_token && <CopyShareLink shareToken={run.share_token} />}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        {[
          { label: 'Total cost',   value: `$${Number(run.total_cost).toFixed(6)}`,                          accent: 'var(--accent)' },
          { label: 'Budget',       value: run.budget ? `$${Number(run.budget).toFixed(2)}` : 'No limit',    accent: 'var(--blue)' },
          { label: 'API calls',    value: (run.call_count || 0).toLocaleString(),                           accent: 'var(--amber)' },
          { label: 'Avg / call',   value: `$${avgCostPerCall.toFixed(5)}`,                                  accent: 'var(--green)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-accent" style={{ background: s.accent }} />
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: '18px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Budget bar */}
      {pct !== null && (
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <span className="section-label">Budget usage</span>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              ${Number(run.total_cost).toFixed(4)} / ${Number(run.budget).toFixed(2)} ({Math.round(pct)}%)
            </span>
          </div>
          <div className="budget-bar-track" style={{ height: '6px' }}>
            <div className="budget-bar-fill" style={{ width: `${pct}%`, background: barColor, height: '6px' }} />
          </div>
          {run.stop_reason && (
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '8px' }}>
              Stop reason: {run.stop_reason}
            </div>
          )}
        </div>
      )}

      {/* Call breakdown */}
      {calls && calls.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-header-label">Call breakdown</span>
            <span style={{ fontSize: '10px', color: 'var(--muted2)' }}>
              {calls.length} calls
            </span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Model</th>
                <th>Input tokens</th>
                <th>Output tokens</th>
                <th>Cost</th>
                <th>Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => {
                return (
                  <tr key={call.id} style={{ cursor: 'default' }}>
                    <td style={{ color: 'var(--muted2)', width: '40px' }}>{call.call_number}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 7px',
                        background: 'var(--bg3)',
                        border: '1px solid var(--border)',
                        borderRadius: '3px',
                        fontSize: '10px',
                        color: 'var(--text2)',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {call.model}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{call.input_tokens?.toLocaleString()}</td>
                    <td style={{ color: 'var(--muted)' }}>{call.output_tokens?.toLocaleString()}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 500 }}>
                      ${Number(call.cost).toFixed(6)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="budget-bar-track" style={{ width: '60px' }}>
                          <div className="budget-bar-fill" style={{
                            width: `${Math.min(100, (call.cumulative_cost / run.total_cost) * 100)}%`,
                            background: 'var(--accent)',
                            opacity: 0.7,
                          }} />
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--muted2)' }}>
                          ${Number(call.cumulative_cost).toFixed(4)}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
