'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteAccountModal() {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleDelete() {
    if (confirm !== 'DELETE') return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Deletion failed'); setLoading(false); return }
      window.location.href = 'https://burnmap.dev'
    } catch {
      setError('Network error. Try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-danger"
        style={{ fontSize: '11px' }}
      >
        Delete account
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div style={{
            background: 'var(--bg1)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '28px',
            width: '100%',
            maxWidth: '400px',
          }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', marginBottom: '8px' }}>
              Delete account
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.65 }}>
              This permanently deletes your account, all runs, projects, and API keys. This cannot be undone.
            </div>

            <label style={{ fontSize: '10.5px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
              Type DELETE to confirm
            </label>
            <input
              className="input"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="DELETE"
              style={{ marginBottom: '16px' }}
            />

            {error && (
              <div style={{ fontSize: '11px', color: 'var(--accent)', background: 'rgba(232,89,60,0.08)', border: '1px solid rgba(232,89,60,0.2)', borderRadius: '4px', padding: '8px 12px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleDelete}
                disabled={confirm !== 'DELETE' || loading}
                className="btn btn-danger"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {loading ? 'Deleting…' : 'Delete permanently'}
              </button>
              <button
                onClick={() => { setOpen(false); setConfirm(''); setError('') }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
