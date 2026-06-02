import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function RunsPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const page = parseInt(searchParams?.page || '1')
  const limit = 25
  const offset = (page - 1) * limit

  const { data: runs, count } = await supabase
    .from('runs')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px' }}>
            All runs
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
            {count || 0} total runs
          </div>
        </div>
      </div>

      {/* Runs table */}
      <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
        {!runs || runs.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>
            No runs yet — wrap your first agent with{' '}
            <code style={{ color: 'var(--accent)' }}>burnmap.run("name")</code>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Run name', 'Status', 'Cost', 'Budget', 'Calls', 'Duration', 'Date'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--muted2)',
                    padding: '12px 18px',
                    fontWeight: 400,
                    borderBottom: '1px solid var(--border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.map(run => {
                const pct = run.budget ? Math.min(100, Math.round((run.total_cost / run.budget) * 100)) : null
                const barColor = pct >= 100 ? '#e8593c' : pct >= 80 ? '#d4943a' : '#4caf7d'
                const dur = run.duration_seconds
                  ? (run.duration_seconds < 60
                    ? `${Number(run.duration_seconds).toFixed(0)}s`
                    : `${Math.round(run.duration_seconds / 60)}m`)
                  : '—'
                const date = new Date(run.started_at)
                const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                return (
                  <Link key={run.id} href={`/dashboard/runs/${run.id}`} style={{ display: 'contents' }}>
                    <tr style={{ cursor: 'pointer' }} className="table-row-hover">
                      <td style={{ padding: '11px 18px', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{run.job_name}</span>
                        {run.project_id && (
                          <div style={{ fontSize: '10px', color: 'var(--muted2)', marginTop: '1px' }}>
                            project #{run.project_id.slice(0, 8)}
                          </div>
                        )}
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
                      <td style={{ padding: '11px 18px', fontSize: '12px', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                        {run.call_count}
                      </td>
                      <td style={{ padding: '11px 18px', fontSize: '12px', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                        {dur}
                      </td>
                      <td style={{ padding: '11px 18px', fontSize: '12px', color: 'var(--muted2)', borderBottom: '1px solid var(--border)' }}>
                        <div>{dateStr}</div>
                        <div style={{ fontSize: '10px', marginTop: '1px' }}>{timeStr}</div>
                      </td>
                    </tr>
                  </Link>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted2)' }}>
              Page {page} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {page > 1 && (
                <Link href={`/dashboard/runs?page=${page - 1}`} style={{
                  fontSize: '11px', color: 'var(--muted)', textDecoration: 'none',
                  padding: '4px 10px', border: '1px solid var(--border)', borderRadius: '4px',
                }}>← prev</Link>
              )}
              {page < totalPages && (
                <Link href={`/dashboard/runs?page=${page + 1}`} style={{
                  fontSize: '11px', color: 'var(--muted)', textDecoration: 'none',
                  padding: '4px 10px', border: '1px solid var(--border)', borderRadius: '4px',
                }}>next →</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
