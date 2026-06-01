'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <span className="text-[#FA3C14] font-semibold tracking-wider text-lg">burnmap</span>
        </div>

        <div className="border border-[#1E2424] bg-[#111414] p-8">
          <h1 className="serif text-2xl text-[#E8E8E6] mb-1">sign in</h1>
          <p className="text-[#6B7070] text-xs mb-8">your real AI bill, before it hits.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[#9AA0A0] text-xs block mb-2">email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-[#0D0F0F] border border-[#1E2424] text-[#E8E8E6] px-3 py-2.5 text-sm outline-none focus:border-[#FA3C14] transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-[#9AA0A0] text-xs block mb-2">password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-[#0D0F0F] border border-[#1E2424] text-[#E8E8E6] px-3 py-2.5 text-sm outline-none focus:border-[#FA3C14] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-[#F87171] text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#FA3C14] text-white font-semibold py-2.5 px-4 text-sm hover:bg-[#DF2C08] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'signing in...' : 'sign in'}
            </button>
          </form>

          <p className="text-[#6B7070] text-xs mt-6 text-center">
            no account?{' '}
            <Link href="/signup" className="text-[#FA3C14] hover:underline">
              sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
