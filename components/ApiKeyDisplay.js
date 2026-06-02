'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function ApiKeyDisplay() {
  const [apiKey, setApiKey] = useState('')
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('api_key').eq('id', user.id).single()
        .then(({ data }) => { if (data?.api_key) setApiKey(data.api_key) })
    })
  }, [])

  const masked = apiKey
    ? apiKey.slice(0, 8) + '•'.repeat(Math.max(0, apiKey.length - 16)) + apiKey.slice(-8)
    : '••••••••••••••••••••••••'

  async function copy() {
    if (!apiKey) return
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable (HTTP, permissions denied) — fail silently
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'var(--bg)',
      border: '1px solid var(--border2)',
      borderRadius: 'var(--radius)',
      padding: '9px 12px',
    }}>
      <code style={{
        flex: 1,
        fontSize: '12px',
        color: visible ? 'var(--accent)' : 'var(--text2)',
        fontFamily: 'var(--mono)',
        letterSpacing: visible ? '0.02em' : '0.05em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {visible ? apiKey : masked}
      </code>

      <button
        onClick={() => setVisible(v => !v)}
        className="btn btn-ghost"
        style={{ padding: '4px 8px', fontSize: '10px', flexShrink: 0 }}
        title={visible ? 'Hide' : 'Reveal'}
      >
        {visible ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M4.5 2.5C5 2.2 5.5 2 6 2c2.8 0 5 4 5 4s-.7 1.3-1.8 2.3M2.3 3.7C1.4 4.7 1 6 1 6s2.2 4 5 4c.5 0 1-.1 1.5-.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" stroke="currentColor" strokeWidth="1.2"/>
            <circle cx="6" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        )}
      </button>

      <button
        onClick={copy}
        className="btn btn-ghost"
        style={{ padding: '4px 8px', fontSize: '10px', flexShrink: 0 }}
        title="Copy to clipboard"
      >
        {copied ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="var(--green)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4 3V2a1 1 0 00-1 1H2a1 1 0 00-1 1v7a1 1 0 001 1h1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        )}
      </button>
    </div>
  )
}
