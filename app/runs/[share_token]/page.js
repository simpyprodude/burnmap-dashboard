import { supabasePublic } from '@/lib/supabase-public'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateMetadata({ params }) {
  const { share_token } = await params
  const { data: run } = await supabasePublic
    .from('runs')
    .select('job_name, total_cost')
    .eq('share_token', share_token)
    .single()
  if (!run) return { title: 'Run not found — Burnmap' }
  return { title: `${run.job_name} · $${Number(run.total_cost).toFixed(4)} — Burnmap` }
}

export default async function PublicRunPage({ params }) {
  const { share_token } = await params

  const { data: run } = await supabasePublic
    .from('runs')
    .select('*')
    .eq('share_token', share_token)
    .single()

  if (!run) notFound()

  const { data: calls } = await supabasePublic
    .from('run_calls')
    .select('*')
    .eq('run_id', run.id)
    .order('call_number', { ascending: true })

  const pct = run.budget ? Math.min(100, (run.total_cost / run.budget) * 100) : null
  const barColor = pct >= 100 ? 'var(--accent)' : pct >= 80 ? 'var(--amber)' : 'var(--green)'

  function dur(s) {
    if (!s) return '—'
    if (s < 60) return `${Number(s).toFixed(1)}s`
    if (s < 3600) return `${(s / 60).toFixed(1)}m`
    return `${(s / 3600).toFixed(2)}h`
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: 'var(--mono)',
    }}>
      {/* Header bar */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg1)',
        padding: '0 24px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="3" stroke="var(--accent)" strokeWidth="1.5"/>
            <path d="M4 11 L8 5 L12 11" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '-0.01em' }}>burnmap</span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--muted)', background: 'var(--bg3)', border: '1px solid var(--border2)', padding: '2px 8px', borderRadius: '3px' }}>
          shared report
        </span>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Title */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '28px', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '6px' }}>
                {run.job_name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {new Date(run.started_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                {run.duration_seconds && ` · ${dur(run.duration_seconds)}`}
              </div>
            </div>
            {run.stopped_early
              ? <span className="pill pill-red">budget exceeded</span>
              : <span className="pill pill-green">completed</span>
            }
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: '20px' }}>
          {[
            { label: 'Total cost',  value: `$${Number(run.total_cost).toFixed(6)}`,                         accent: 'var(--accent)' },
            { label: 'Budget',      value: run.budget ? `$${Number(run.budget).toFixed(2)}` : 'No limit',   accent: 'var(--blue)' },
            { label: 'API calls',   value: (run.call_count || 0).toLocaleString(),                          accent: 'var(--amber)' },
            { label: 'Duration',    value: dur(run.duration_seconds),                                        accent: 'var(--green)' },
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
          <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
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
          <div className="card" style={{ marginBottom: '32px' }}>
            <div className="card-header">
              <span className="card-header-label">Call breakdown</span>
              <span style={{ fontSize: '10px', color: 'var(--muted2)' }}>{calls.length} calls</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Model</th>
                  <th>Input</th>
                  <th>Output</th>
                  <th>Cost</th>
                  <th>Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {calls.map(call => (
                  <tr key={call.id} style={{ cursor: 'default' }}>
                    <td style={{ color: 'var(--muted2)' }}>{call.call_number}</td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '2px 7px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '3px', fontSize: '10px', color: 'var(--text2)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {call.model}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{call.input_tokens?.toLocaleString()}</td>
                    <td style={{ color: 'var(--muted)' }}>{call.output_tokens?.toLocaleString()}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 500 }}>${Number(call.cost).toFixed(6)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="budget-bar-track" style={{ width: '56px' }}>
                          <div className="budget-bar-fill" style={{ width: `${Math.min(100, (call.cumulative_cost / run.total_cost) * 100)}%`, background: 'var(--accent)', opacity: 0.7 }} />
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--muted2)' }}>${Number(call.cumulative_cost).toFixed(4)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CTA */}
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '24px',
          textAlign: 'center',
          background: 'var(--bg1)',
        }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', marginBottom: '6px' }}>
            Track your own agent costs
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '16px' }}>
            Set budgets. Get reports like this one. Know before it costs you.
          </div>
          <a
            href="https://burnmap.dev"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'var(--accent)', color: '#fff', borderRadius: '5px',
              padding: '9px 18px', fontSize: '12px', fontWeight: 600,
              textDecoration: 'none', fontFamily: 'var(--mono)',
            }}
          >
            burnmap.dev →
          </a>
        </div>
      </div>
    </div>
  )
}
