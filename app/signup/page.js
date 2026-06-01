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
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <span className="text-[#FA3C14] font-semibold tracking-wider text-lg block mb-10">burnmap</span>
        <div className="border border-[#1E2424] bg-[#111414] p-8">
          <h1 className="serif text-2xl text-[#E8E8E6] mb-3">check your inbox</h1>
          <p className="text-[#9AA0A0] text-xs leading-relaxed">
            we sent a confirmation link to <span className="text-[#E8E8E6]">{email}</span>.<br />
            click it to activate your account.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="text-[#FA3C14] font-semibold tracking-wider text-lg">burnmap</span>
        </div>

        <div className="border border-[#1E2424] bg-[#111414] p-8">
          <h1 className="serif text-2xl text-[#E8E8E6] mb-1">create account</h1>
          <p className="text-[#6B7070] text-xs mb-8">free forever. no credit card.</p>

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
                minLength={8}
                className="w-full bg-[#0D0F0F] border border-[#1E2424] text-[#E8E8E6] px-3 py-2.5 text-sm outline-none focus:border-[#FA3C14] transition-colors"
                placeholder="min 8 characters"
              />
            </div>

            {error && <p className="text-[#F87171] text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#FA3C14] text-white font-semibold py-2.5 px-4 text-sm hover:bg-[#DF2C08] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'creating account...' : 'create account'}
            </button>
          </form>

          <p className="text-[#6B7070] text-xs mt-6 text-center">
            already have an account?{' '}
            <Link href="/login" className="text-[#FA3C14] hover:underline">sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
