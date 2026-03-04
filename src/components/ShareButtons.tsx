'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareOnX = () => {
    const xUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(xUrl, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-8 border-t border-b border-gray-300">
      <span className="text-sm font-semibold text-gray-700">Share:</span>
      <button
        onClick={copyToClipboard}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold text-sm transition"
      >
        {copied ? 'âœ“ Copied' : 'ðŸ“‹ Copy Link'}
      </button>
      <button
        onClick={shareOnFacebook}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition"
      >
        f Facebook
      </button>
      <button
        onClick={shareOnX}
        className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold text-sm transition"
      >
        ð• X
      </button>
      <button
        onClick={shareOnLinkedIn}
        className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold text-sm transition"
      >
        in LinkedIn
      </button>
    </div>
  );
}
