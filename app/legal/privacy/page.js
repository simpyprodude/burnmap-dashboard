import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Burnmap',
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--mono)' }}>
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg1)', padding: '0 24px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="https://burnmap.dev" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="3" stroke="var(--accent)" strokeWidth="1.5"/>
            <path d="M4 11 L8 5 L12 11" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>burnmap</span>
        </Link>
        <Link href="/legal/terms" style={{ fontSize: '11px', color: 'var(--muted)' }}>Terms of Service →</Link>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '32px', marginBottom: '6px', letterSpacing: '-0.02em' }}>Privacy Policy</h1>
        <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '40px' }}>Last updated: June 2, 2026</p>

        <Section title="What We Collect">
          <ul>
            <li><strong>Email address</strong> — used for account creation, login, and transactional emails.</li>
            <li><strong>Agent run metadata</strong> — job name, model, token counts, cost, duration, timestamps. We never receive the content of your prompts or completions.</li>
            <li><strong>API key hash</strong> — we store a SHA-256 hash of your API key. The raw key is never stored.</li>
            <li><strong>Billing data</strong> — if you subscribe, Stripe handles payment processing. We store only your Stripe customer ID.</li>
            <li><strong>Usage logs</strong> — standard server logs (IP, request path, response code) retained for 7 days for debugging.</li>
          </ul>
        </Section>

        <Section title="How We Use It">
          We use your data to: provide the service, send transactional emails about your account, enforce plan limits, and improve the product. We do not sell your data, run ads, or share it with third parties except as described below.
        </Section>

        <Section title="Data Storage">
          All data is stored in Supabase (PostgreSQL) hosted in the United States (AWS us-east-1). Data is encrypted at rest and in transit.
        </Section>

        <Section title="Data Retention">
          <ul>
            <li><strong>Free tier:</strong> run data (runs, run_calls) is deleted after 30 days. Account data (email, profile) is retained until you delete your account.</li>
            <li><strong>Paid tiers:</strong> run data is retained for 1 year from the run date.</li>
            <li><strong>Waitlist data:</strong> email addresses collected pre-launch are retained until you unsubscribe or request deletion.</li>
          </ul>
        </Section>

        <Section title="Third Parties">
          <ul>
            <li><strong>Supabase</strong> — database and authentication (US)</li>
            <li><strong>Vercel</strong> — hosting and CDN (US/global edge)</li>
            <li><strong>Resend</strong> — transactional email delivery (US)</li>
            <li><strong>Stripe</strong> — payment processing (US)</li>
          </ul>
          Each provider is bound by their own privacy policy and applicable data processing agreements.
        </Section>

        <Section title="Your Rights">
          You have the right to:
          <ul>
            <li><strong>Access</strong> your data — export from the dashboard or email us.</li>
            <li><strong>Delete</strong> your account and all associated data — use the Settings → Delete Account flow or email <a href="mailto:remon@burnmap.dev" style={{ color: 'var(--accent)' }}>remon@burnmap.dev</a>.</li>
            <li><strong>Unsubscribe</strong> from marketing emails — click the unsubscribe link in any email.</li>
            <li><strong>Correct</strong> inaccurate data — contact us by email.</li>
          </ul>
          We will respond to deletion requests within 30 days.
        </Section>

        <Section title="Cookies">
          We use only session cookies set by Supabase Auth (HttpOnly, Secure, SameSite=Strict). No tracking or advertising cookies.
        </Section>

        <Section title="Contact">
          Privacy questions: <a href="mailto:remon@burnmap.dev" style={{ color: 'var(--accent)' }}>remon@burnmap.dev</a>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px', letterSpacing: '0.02em' }}>{title}</h2>
      <div style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.75 }}>{children}</div>
    </div>
  )
}
