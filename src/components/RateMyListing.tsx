'use client'

import { useState } from 'react'

interface ListingResult {
  title: string
  score: number
  feedback: string[]
}

export default function RateMyListing() {
  const [listing, setListing] = useState('')
  const [results, setResults] = useState<ListingResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing }),
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <form onSubmit={handleSubmit}>
        <textarea
          value={listing}
          onChange={(e) => setListing(e.target.value)}
          placeholder="Paste listing here..."
          style={{
            width: '100%',
            height: 150,
            padding: 10,
            marginBottom: 10,
            borderRadius: 4,
            border: '1px solid #ddd',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Analyzing...' : 'Rate Listing'}
        </button>
      </form>

      {results && (
        <div style={{ marginTop: 20, padding: 15, background: '#f0f0f0', borderRadius: 4 }}>
          <h3>{results.title}</h3>
          <p>Score: {results.score}/100</p>
          <ul>
            {results.feedback.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
