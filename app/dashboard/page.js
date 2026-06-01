import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

function fmt(n) {
  return Number(n || 0).toFixed(4)
}

function fmtShort(n) {
  return Number(n || 0).toFixed(2)
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

  const totalSpent = runs?.reduce((sum, r) => sum + Number(r.total_cost), 0) || 0
  const totalRuns = runs?.length || 0
  const stoppedEarly = runs?.filter(r => r.stopped_early).length || 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="serif text-3xl text-[#E8E8E6] mb-1">runs</h1>
        <p className="text-[#6B7070] text-xs">all agent runs tracked by burnmap.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px bg-[#1E2424] border border-[#1E2424] mb-8">
        {[
          { label: 'total spent', value: `$${fmtShort(totalSpent)}` },
          { label: 'runs tracked', value: totalRuns },
          { label: 'stopped early', value: stoppedEarly },
        ].map(stat => (
          <div key={stat.label} className="bg-[#111414] px-6 py-5">
            <div className="text-[11px] text-[#6B7070] uppercase tracking-wider mb-2">{stat.label}</div>
            <div className="serif text-2xl text-[#E8E8E6]">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Runs table */}
      {!runs || runs.length === 0 ? (
        <div className="border border-[#1E2424] bg-[#111414] p-12 text-center">
          <p className="text-[#6B7070] text-sm mb-4">no runs yet.</p>
          <p className="text-[#6B7070] text-xs">install the SDK and wrap your first agent run.</p>
          <code className="block mt-4 text-[#FA3C14] text-xs">pip install burnmap</code>
        </div>
      ) : (
        <div className="border border-[#1E2424]">
          <div className="grid grid-cols-5 gap-px bg-[#1E2424] border-b border-[#1E2424]">
            {['job', 'cost', 'calls', 'duration', 'status'].map(h => (
              <div key={h} className="bg-[#0D0F0F] px-4 py-2 text-[10px] text-[#6B7070] uppercase tracking-wider">{h}</div>
            ))}
          </div>
          {runs.map(run => (
            <Link
              key={run.id}
              href={`/dashboard/runs/${run.id}`}
              className="grid grid-cols-5 gap-px bg-[#1E2424] hover:bg-[#161A1A] transition-colors group"
            >
              <div className="bg-[#111414] group-hover:bg-[#161A1A] px-4 py-3 text-[#E8E8E6] text-xs truncate transition-colors">{run.job_name}</div>
              <div className="bg-[#111414] group-hover:bg-[#161A1A] px-4 py-3 text-xs transition-colors">
                <span className={run.stopped_early ? 'text-[#F87171]' : 'text-[#4ADE80]'}>
                  ${fmt(run.total_cost)}
                </span>
                {run.budget && <span className="text-[#6B7070]"> / ${fmtShort(run.budget)}</span>}
              </div>
              <div className="bg-[#111414] group-hover:bg-[#161A1A] px-4 py-3 text-[#9AA0A0] text-xs transition-colors">{run.call_count}</div>
              <div className="bg-[#111414] group-hover:bg-[#161A1A] px-4 py-3 text-[#9AA0A0] text-xs transition-colors">
                {run.duration_seconds ? `${Number(run.duration_seconds).toFixed(1)}s` : '—'}
              </div>
              <div className="bg-[#111414] group-hover:bg-[#161A1A] px-4 py-3 text-xs transition-colors">
                {run.stopped_early
                  ? <span className="text-[#F87171]">stopped · {run.stop_reason || 'limit'}</span>
                  : <span className="text-[#4ADE80]">complete</span>
                }
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
