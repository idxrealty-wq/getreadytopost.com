'use client';

import { useState } from 'react';

export default function EmbedCodePage() {
  const [verificationId, setVerificationId] = useState('GRTP-AGENT-DEMO-001');
  const [copied, setCopied] = useState(false);

  const embedCode = `<!-- GRTP Verified Badge -->
<div data-grtp-badge="${verificationId}"></div>
<script src="https://getreadytopost.com/grtp-badge.js" defer></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 pt-28 pb-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Verified Badge
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Embed Your Verification Badge
          </h1>
          <p className="mt-3 text-slate-400">
            Copy this code and paste it on any website. The badge always shows
            your live verification status directly from GetReadyToPost.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Your Verification ID
            </label>
            <input
              type="text"
              value={verificationId}
              onChange={(e) => setVerificationId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Embed Code
            </label>
            <pre className="mt-2 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-emerald-300 overflow-x-auto whitespace-pre-wrap">
              {embedCode}
            </pre>
          </div>

          <button
            onClick={handleCopy}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            {copied ? '✓ Copied!' : 'Copy Embed Code'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <h2 className="text-lg font-bold text-white">How it works</h2>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex gap-2">
              <span className="text-emerald-400">1.</span>
              <span>Copy the embed code above</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">2.</span>
              <span>Paste it anywhere on your website, bio, or profile page</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">3.</span>
              <span>The badge loads your live verification status automatically</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">4.</span>
              <span>If your verification expires or is revoked the badge updates instantly — it cannot be faked</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">5.</span>
              <span>Clicking the badge takes visitors to your live verification record on GetReadyToPost</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
