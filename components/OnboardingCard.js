'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function OnboardingCard() {
  const [apiKey, setApiKey] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('api_key').eq('id', user.id).single()
        .then(({ data }) => { if (data?.api_key) setApiKey(data.api_key) })
    })
  }, [])

  async function copyKey() {
    if (!apiKey) return
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const maskedKey = apiKey
    ? `${apiKey.slice(0, 8)}${'•'.repeat(Math.max(0, apiKey.length - 16))}${apiKey.slice(-8)}`
    : 'loading…'

  return (
    <div style={{
      border: '1px solid var(--accent)',
      borderRadius: '6px',
      background: 'rgba(232,89,60,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(232,89,60,0.15)',
        background: 'rgba(232,89,60,0.06)',
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.46 2.46l1.06 1.06M10.48 10.48l1.06 1.06M2.46 11.54l1.06-1.06M10.48 3.52l1.06-1.06" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round"/>
          <circle cx="7" cy="7" r="2" stroke="var(--accent)" strokeWidth="1.3"/>
        </svg>
        <span style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>
          You're in. Here's how to track your first run.
        </span>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <Step n={1} title="Install the SDK">
          <div className="code-block" style={{ marginTop: '6px' }}>
            pip install burnmap
          </div>
        </Step>

        <Step n={2} title="Add to your agent">
          <div className="code-block" style={{ marginTop: '6px', lineHeight: 2 }}>
            <div><span style={{ color: 'var(--muted)' }}>import</span> burnmap</div>
            <div>
              <span style={{ color: 'var(--muted)' }}>burnmap.configure(api_key=</span>
              <span style={{ color: 'var(--accent)' }}>"{maskedKey}"</span>
              <span style={{ color: 'var(--muted)' }}>)</span>
            </div>
            <div>
              <span style={{ color: 'var(--muted)' }}>with burnmap.run(</span>
              <span style={{ color: 'var(--accent)' }}>"my-agent"</span>
              <span style={{ color: 'var(--muted)' }}>, budget=</span>
              <span style={{ color: 'var(--amber)' }}>1.00</span>
              <span style={{ color: 'var(--muted)' }}>):</span>
            </div>
            <div style={{ paddingLeft: '24px', color: 'var(--muted2)' }}># your agent code here</div>
          </div>
        </Step>

        <Step n={3} title="Run it — your spend appears here automatically" />

        <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
          <button onClick={copyKey} className="btn btn-primary" style={{ fontSize: '11px' }}>
            {copied ? '✓ Copied' : 'Copy API key'}
          </button>
          <a
            href="https://github.com/burnmap-dev/burnmap"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ fontSize: '11px', textDecoration: 'none' }}
          >
            View docs →
          </a>
        </div>
      </div>
    </div>
  )
}

function Step({ n, title, children }) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        background: 'var(--bg3)', border: '1px solid var(--border2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', color: 'var(--muted)', flexShrink: 0, marginTop: '1px',
      }}>
        {n}
      </div>
      <div>
        <div style={{ fontSize: '12px', color: 'var(--text)', marginBottom: children ? '0' : '0' }}>{title}</div>
        {children}
      </div>
    </div>
  )
}
