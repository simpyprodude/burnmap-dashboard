'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setProjects(data || [])
  }

  async function createProject(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('projects').insert({ name: name.trim(), user_id: user.id })
    setName('')
    setLoading(false)
    loadProjects()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="serif text-3xl text-[#E8E8E6] mb-1">projects</h1>
        <p className="text-[#6B7070] text-xs">group your runs by project.</p>
      </div>

      {/* Create form */}
      <form onSubmit={createProject} className="flex gap-0 mb-8 max-w-md">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="project name"
          className="flex-1 bg-[#111414] border border-[#1E2424] border-r-0 text-[#E8E8E6] px-3 py-2.5 text-sm outline-none focus:border-[#FA3C14] transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#FA3C14] text-white px-4 py-2.5 text-xs font-semibold hover:bg-[#DF2C08] transition-colors disabled:opacity-60"
        >
          create
        </button>
      </form>

      {/* Projects list */}
      {projects.length === 0 ? (
        <div className="border border-[#1E2424] bg-[#111414] p-10 text-center">
          <p className="text-[#6B7070] text-sm">no projects yet.</p>
        </div>
      ) : (
        <div className="border border-[#1E2424]">
          {projects.map(p => (
            <div key={p.id} className="border-b border-[#1E2424] last:border-0 px-5 py-3 bg-[#111414] flex items-center justify-between">
              <span className="text-[#E8E8E6] text-sm">{p.name}</span>
              <span className="text-[#6B7070] text-xs">{new Date(p.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
