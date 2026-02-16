'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RateListingPage() {
  const [listing, setListing] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!listing.trim()) {
      alert('Please paste a listing description')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing }),
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Error analyzing listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <Link href="/" style={{ marginBottom: 16, display: 'block', color: '#0066cc' }}>
        ← Back
      </Link>

      <h1 style={{ fontSize: 32, marginBottom: 12 }}>Analyze Your Listing</h1>

      <textarea
        value={listing}
        onChange={(e) => setListing(e.target.value)}
        placeholder="Paste your listing description here..."
        style={{
          width: '100%',
          height: 200,
          padding: 12,
          borderRadius: 8,
          border: '1px solid #ccc',
          fontFamily: 'monospace',
          marginBottom: 16,
        }}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading}
        style={{
          padding: '12px 24px',
          borderRadius: 8,
          background: loading ? '#ccc' : '#111',
          color: '#fff',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: 24,
        }}
      >
        {loading ? 'Analyzing...' : 'Analyze Listing'}
      </button>

      {results && (
        <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
          <h2>Results</h2>
          <pre style={{ overflow: 'auto' }}>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </main>
  )
}
