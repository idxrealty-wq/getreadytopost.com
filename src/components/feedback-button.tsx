"use client";
import Link from 'next/link';

export default function FeedbackButton() {
  return (
    <Link
      href="/feedback"
      className="fixed bottom-6 right-6 bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-full font-bold shadow-2xl transition z-50 flex items-center gap-2"
    >
      💬 Feedback
    </Link>
  );
}
