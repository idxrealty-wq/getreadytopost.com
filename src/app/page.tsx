import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>Rate My Listing</h1>
      <p style={{ marginBottom: 16 }}>
        Paste your real estate listing description and get instant feedback across key categories.
      </p>

      <Link
        href="/rate-listing"
        style={{
          display: 'inline-block',
          padding: '12px 16px',
          borderRadius: 8,
          background: '#111',
          color: '#fff',
          textDecoration: 'none',
        }}
      >
        Start Free Analysis
      </Link>
    </main>
  )
}
