'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  if (done) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="3" stroke="var(--accent)" strokeWidth="1.5"/>
            <path d="M4 11 L8 5 L12 11" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '15px', fontWeight: '600', color: 'var(--text)', letterSpacing: '-0.01em' }}>
            burnmap
          </span>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(76,175,125,0.12)', border: '1px solid rgba(76,175,125,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9l4 4 8-8" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--text)', marginBottom: '8px' }}>
            Check your inbox
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>
            We sent a confirmation link to{' '}
            <span style={{ color: 'var(--text2)' }}>{email}</span>.
            <br />Click it to activate your account.
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="14" height="14" rx="3" stroke="var(--accent)" strokeWidth="1.5"/>
              <path d="M4 11 L8 5 L12 11" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '15px', fontWeight: '600', color: 'var(--text)', letterSpacing: '-0.01em' }}>
              burnmap
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '22px', color: 'var(--text)', marginBottom: '4px' }}>
              Create account
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Free forever. No credit card.
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10.5px', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10.5px', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="input"
                placeholder="min 8 characters"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div style={{
                fontSize: '11px',
                color: 'var(--accent)',
                background: 'rgba(232,89,60,0.08)',
                border: '1px solid rgba(232,89,60,0.2)',
                borderRadius: 'var(--radius)',
                padding: '8px 12px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: '4px' }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '11px', color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link href="/login" className="link-accent">Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
