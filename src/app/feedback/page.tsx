"use client";
import { useState } from 'react';

export default function FeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('https://alluring-encouragement-production.up.railway.app/public/lead_v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          name: name,
          details: 'FEEDBACK: ' + message,
          knowledge_profile_id: 'a586949b-617c-4d57-902c-ef7507f76899',
        }),
      });

      if (response.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-bold text-white mb-4 text-center">💬 Feedback</h1>
        <p className="text-gray-300 text-xl text-center mb-12">
          We are building GetReadyToPost for agents like you. Your feedback helps us improve.
        </p>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">Your Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">Your Feedback *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think, what features you need, bugs you found, or anything else..."
                rows={8}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-[#c9a227] hover:bg-[#b8911f] text-white py-3 rounded-xl font-bold text-lg transition disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending...' : 'Send Feedback'}
            </button>
            {status === 'success' && (
              <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-4 text-center">
                <p className="text-green-300 font-bold">Thank you! We received your feedback.</p>
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 text-center">
                <p className="text-red-300 font-bold">Something went wrong. Please try again.</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
