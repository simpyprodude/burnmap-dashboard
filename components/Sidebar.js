'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Sidebar({ profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/dashboard', label: 'runs' },
    { href: '/dashboard/projects', label: 'projects' },
    { href: '/dashboard/settings', label: 'settings' },
  ]

  return (
    <aside className="w-52 border-r border-[#1E2424] flex flex-col min-h-screen bg-[#0D0F0F]">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#1E2424]">
        <span className="text-[#FA3C14] font-semibold tracking-wider">burnmap</span>
      </div>

      {/* Plan badge */}
      <div className="px-6 py-3 border-b border-[#1E2424]">
        <span className="text-[10px] text-[#6B7070] uppercase tracking-widest">{profile?.plan || 'free'}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 text-xs transition-colors ${
              pathname === link.href
                ? 'text-[#E8E8E6] bg-[#161A1A]'
                : 'text-[#6B7070] hover:text-[#9AA0A0]'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#1E2424]">
        <p className="text-[#6B7070] text-[11px] truncate mb-2">{profile?.email}</p>
        <button
          onClick={signOut}
          className="text-[11px] text-[#6B7070] hover:text-[#FA3C14] transition-colors"
        >
          sign out
        </button>
      </div>
    </aside>
  )
}
