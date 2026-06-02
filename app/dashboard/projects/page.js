'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const loadProjects = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('projects')
      .select('*, runs(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setProjects(data || [])
    setFetching(false)
  }, [])

  useEffect(() => { loadProjects() }, [loadProjects])

  async function createProject(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('projects').insert({ name: name.trim(), user_id: user.id })
    setName('')
    setLoading(false)
    loadProjects()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-sub">{projects.length} project{projects.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Create form */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          New project
        </div>
        <form onSubmit={createProject} style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
          <input
            className="input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="project-name"
            maxLength={64}
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="btn btn-primary"
            style={{ flexShrink: 0 }}
          >
            {loading ? 'creating…' : 'Create'}
          </button>
        </form>
      </div>

      {/* Projects list */}
      <div className="card">
        {fetching ? (
          <div className="empty-state">
            <div className="empty-sub">Loading…</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: 'var(--muted2)', marginBottom: '4px' }}>
              <path d="M4 10h24M4 10V26a2 2 0 002 2h20a2 2 0 002-2V10M4 10V7a2 2 0 012-2h6l2 3h12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <div className="empty-title">No projects yet</div>
            <div className="empty-sub">Create a project to group your agent runs and track costs per initiative.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Runs</th>
                <th>Created</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} style={{ cursor: 'default' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '7px', height: '7px', borderRadius: '2px',
                        background: 'var(--accent)', flexShrink: 0,
                      }} />
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--muted)' }}>
                      {p.runs?.[0]?.count ?? 0}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted2)' }}>
                    {new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <div style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '9px',
                      color: 'var(--muted2)',
                      padding: '2px 6px',
                      background: 'var(--bg3)',
                      border: '1px solid var(--border)',
                      borderRadius: '3px',
                    }}>
                      {p.id.slice(0, 6)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
