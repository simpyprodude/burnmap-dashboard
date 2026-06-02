import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function RunsPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const params = await searchParams
  const page = Math.max(1, parseInt(params?.page || '1') || 1)
  const limit = 25
  const offset = (page - 1) * limit

  const { data: runs, count } = await supabase
    .from('runs')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const totalPages = Math.ceil((count || 0) / limit)
  const totalSpent = runs?.reduce((s, r) => s + Number(r.total_cost), 0) || 0

  function dur(seconds) {
    if (!seconds) return '—'
    if (seconds < 60) return `${Number(seconds).toFixed(0)}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    return `${(seconds / 3600).toFixed(1)}h`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Runs</div>
          <div className="page-sub">
            {count || 0} total · ${totalSpent.toFixed(2)} spent
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {!runs || runs.length === 0 ? (
          <div className="empty-state">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: 'var(--muted2)', marginBottom: '4px' }}>
              <rect x="4" y="4" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 10h14M9 16h9M9 22h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div className="empty-title">No runs yet</div>
            <div className="empty-sub">
              Wrap an agent session with{' '}
              <code style={{ color: 'var(--accent)', fontSize: '11px' }}>burnmap.run("name")</code>{' '}
              to start tracking.
            </div>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Run</th>
                  <th>Status</th>
                  <th>Cost</th>
                  <th>Budget</th>
                  <th>Calls</th>
                  <th>Duration</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {runs.map(run => {
                  const pct = run.budget ? Math.min(100, Math.round((run.total_cost / run.budget) * 100)) : null
                  const barColor = pct >= 100 ? 'var(--accent)' : pct >= 80 ? 'var(--amber)' : 'var(--green)'
                  const date = new Date(run.started_at)

                  return (
                    <tr key={run.id}>
                      <td>
                        <Link href={`/dashboard/runs/${run.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                          <span style={{ color: 'var(--text)', fontWeight: 500 }}>{run.job_name}</span>
                          {run.project_id && (
                            <div style={{ fontSize: '10px', color: 'var(--muted2)', marginTop: '2px' }}>
                              {run.project_id.slice(0, 8)}
                            </div>
                          )}
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
                            <div className="budget-bar-track" style={{ width: '72px', marginBottom: '3px' }}>
                              <div className="budget-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--muted2)' }}>
                              {pct}%
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--muted2)', fontSize: '11px' }}>—</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--muted)' }}>{run.call_count?.toLocaleString()}</td>
                      <td style={{ color: 'var(--muted)' }}>{dur(run.duration_seconds)}</td>
                      <td style={{ color: 'var(--muted2)' }}>
                        <div>{date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                        <div style={{ fontSize: '10px', marginTop: '1px' }}>
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-info">
                  Page {page} of {totalPages} · {count} runs
                </span>
                <div className="pagination-controls">
                  {page > 1 && (
                    <Link href={`/dashboard/runs?page=${page - 1}`} className="btn btn-ghost" style={{ padding: '5px 10px', textDecoration: 'none' }}>
                      ← Prev
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link href={`/dashboard/runs?page=${page + 1}`} className="btn btn-ghost" style={{ padding: '5px 10px', textDecoration: 'none' }}>
                      Next →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
