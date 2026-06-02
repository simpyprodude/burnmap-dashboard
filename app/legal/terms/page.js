import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — Burnmap',
}

export default function TermsPage() {
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
        <Link href="/legal/privacy" style={{ fontSize: '11px', color: 'var(--muted)' }}>Privacy Policy →</Link>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '32px', marginBottom: '6px', letterSpacing: '-0.02em' }}>Terms of Service</h1>
        <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '40px' }}>Last updated: June 2, 2026</p>

        <Section title="1. Service Description">
          Burnmap is an LLM cost monitoring and budget enforcement tool. We provide a Python SDK and web dashboard that track API spending across Anthropic and OpenAI models. By using Burnmap you agree to these terms.
        </Section>

        <Section title="2. Acceptable Use">
          You may use Burnmap only for lawful purposes. You must not:
          <ul>
            <li>Attempt to reverse-engineer, scrape, or attack our infrastructure</li>
            <li>Share your API key or allow others to ingest data on your behalf without authorization</li>
            <li>Use the service to process or store data you do not have rights to</li>
            <li>Circumvent free-tier limits through multiple accounts</li>
          </ul>
          We reserve the right to suspend accounts that violate these rules without notice.
        </Section>

        <Section title="3. Accounts and API Keys">
          You are responsible for maintaining the security of your API key. If your key is compromised, regenerate it immediately from the settings page. We store only a cryptographic hash of your key — we cannot recover it if lost.
        </Section>

        <Section title="4. Payment Terms">
          Paid plans are billed monthly via Stripe. Fees are charged at the start of each billing period and are non-refundable except where required by law. Downgrading to the free tier takes effect at the end of the current billing period. We reserve the right to change pricing with 30 days notice.
        </Section>

        <Section title="5. Data Retention">
          Free tier: run data is retained for 30 days, then automatically deleted. Paid tiers: data is retained for 1 year from the date of ingestion. You may delete your data at any time by deleting your account.
        </Section>

        <Section title="6. Termination">
          You may close your account at any time from the settings page. We may terminate accounts that violate these terms or remain inactive for more than 12 months on the free tier. On termination, your data is deleted within 30 days.
        </Section>

        <Section title="7. Disclaimer of Warranties">
          Burnmap is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service, accurate cost calculations, or compatibility with all LLM provider APIs. We are not liable for any costs you incur from your LLM provider.
        </Section>

        <Section title="8. Limitation of Liability">
          To the maximum extent permitted by law, Burnmap's total liability for any claim arising from these terms or the service is limited to the fees you paid in the 3 months prior to the claim.
        </Section>

        <Section title="9. Contact">
          Questions about these terms: <a href="mailto:remon@burnmap.dev" style={{ color: 'var(--accent)' }}>remon@burnmap.dev</a>
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
