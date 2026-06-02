'use client'
import { useState } from 'react'

export default function CopyShareLink({ shareToken }) {
  const [copied, setCopied] = useState(false)
  const url = `https://dashboard.burnmap.dev/runs/${shareToken}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select input
    }
  }

  return (
    <button onClick={copy} className="btn btn-ghost" style={{ fontSize: '11px' }}>
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="var(--green)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4 2h5a1 1 0 011 1v6M3 4H2a1 1 0 00-1 1v5a1 1 0 001 1h5a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          Copy share link
        </>
      )}
    </button>
  )
}
