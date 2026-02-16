"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface Analysis {
  overall: string;
  categories: Record<string, { grade: string; feedback: string }>;
  rewrite: string;
  recommendations: string[];
}

interface Submission {
  email: string;
  listingText: string;
  status: string;
  analysis?: Analysis;
}

const gradeColors: Record<string, string> = {
  A: 'from-green-400 to-emerald-600',
  B: 'from-blue-400 to-blue-600',
  C: 'from-yellow-400 to-orange-500',
  D: 'from-red-400 to-red-600',
};

const gradeBarWidth: Record<string, string> = {
  A: 'w-[95%]',
  B: 'w-[75%]',
  C: 'w-[50%]',
  D: 'w-[25%]',
};

const gradeBg: Record<string, string> = {
  A: 'bg-green-500',
  B: 'bg-blue-500',
  C: 'bg-yellow-500',
  D: 'bg-red-500',
};

const categoryLabels: Record<string, string> = {
  headline: '📝 Headline Quality',
  length: '📏 Description Length',
  emotion: '❤️ Emotional Appeal',
  keywords: '🔍 Keywords & SEO',
  cta: '🎯 Call to Action',
  professionalism: '👔 Professionalism',
};

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('id');
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!submissionId) return;

    const unsubscribe = onSnapshot(doc(db, 'submissions', submissionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Submission;
        setSubmission(data);
        if (data.status === 'completed' && data.analysis) {
          setLoading(false);
          setTimeout(() => setRevealed(true), 300);
        }
      }
    });

    return () => unsubscribe();
  }, [submissionId]);

  const copyRewrite = () => {
    if (submission?.analysis?.rewrite) {
      navigator.clipboard.writeText(submission.analysis.rewrite);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!submissionId) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">No submission found</h1>
          <Link href="/rate-my-listing" className="text-[#c9a227] hover:underline">← Go to Rate My Listing</Link>
        </div>
      </main>
    );
  }

  return (
    <main 
      className="pt-20 min-h-screen relative"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2b4a]/95 via-[#2d4a7c]/95 to-[#1a2b4a]/95"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block mb-8">
              <div className="w-20 h-20 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Analyzing Your Listing...</h2>
            <p className="text-gray-300 text-lg mb-2">Our AI is grading your listing across 6 categories</p>
            <p className="text-gray-400">This usually takes 30-60 seconds</p>
            <div className="mt-8 max-w-md mx-auto">
              <div className="flex items-center gap-3 text-left text-gray-300 mb-3">
                <div className="w-5 h-5 rounded-full bg-[#c9a227] animate-pulse"></div>
                <span>Evaluating headline quality...</span>
              </div>
              <div className="flex items-center gap-3 text-left text-gray-300 mb-3">
                <div className="w-5 h-5 rounded-full bg-[#c9a227] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span>Checking keyword optimization...</span>
              </div>
              <div className="flex items-center gap-3 text-left text-gray-300 mb-3">
                <div className="w-5 h-5 rounded-full bg-[#c9a227] animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span>Crafting your professional rewrite...</span>
              </div>
              <div className="flex items-center gap-3 text-left text-gray-300">
                <div className="w-5 h-5 rounded-full bg-[#c9a227] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <span>Generating recommendations...</span>
              </div>
            </div>
          </div>
        ) : submission?.analysis ? (
          <div className={`transition-all duration-1000 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            
            {/* Overall Grade */}
            <div className="text-center mb-10">
              <p className="text-[#c9a227] font-semibold text-sm uppercase tracking-widest mb-2">Your Listing Grade</p>
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${gradeColors[submission.analysis.overall] || gradeColors['C']} shadow-2xl mb-4`}>
                <span className="text-6xl font-black text-white">{submission.analysis.overall}</span>
              </div>
              <p className="text-gray-300 text-lg mt-2">
                {submission.analysis.overall === 'A' && "Excellent! Your listing is top-tier."}
                {submission.analysis.overall === 'B' && "Good listing, but there's room to improve."}
                {submission.analysis.overall === 'C' && "Needs work. Key improvements below."}
                {submission.analysis.overall === 'D' && "Significant improvements needed."}
              </p>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {Object.entries(submission.analysis.categories).map(([key, val], i) => (
                <div 
                  key={key} 
                  className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-xl transition-all duration-500"
                  style={{ transitionDelay: `${i * 150}ms`, opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(20px)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{categoryLabels[key] || key}</span>
                    <span className={`text-lg font-black px-3 py-1 rounded-lg ${gradeBg[val.grade]} text-white`}>{val.grade}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                    <div className={`h-2 rounded-full ${gradeBg[val.grade]} ${gradeBarWidth[val.grade]} transition-all duration-1000`} style={{ transitionDelay: `${i * 150 + 500}ms` }}></div>
                  </div>
                  <p className="text-gray-300 text-sm">{val.feedback}</p>
                </div>
              ))}
            </div>

            {/* Professional Rewrite */}
            <div className="bg-gradient-to-br from-emerald-900/60 to-green-900/40 backdrop-blur-md rounded-2xl p-8 border-2 border-emerald-500/40 shadow-2xl mb-10 relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">✨ Your Professional Rewrite</h2>
                <button 
                  onClick={copyRewrite}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-lg"
                >
                  {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
                </button>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-inner">
                <p className="text-white text-lg leading-relaxed">{submission.analysis.rewrite}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-600/40 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">MLS-Ready</span>
                <span className="bg-emerald-600/40 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">Fair Housing Compliant</span>
                <span className="bg-emerald-600/40 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">SEO Optimized</span>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl mb-10">
              <h2 className="text-2xl font-bold text-white mb-6">💡 Key Recommendations</h2>
              <div className="space-y-4">
                {submission.analysis.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#c9a227] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                      <span className="text-white font-bold text-sm">{i + 1}</span>
                    </div>
                    <p className="text-gray-200 text-lg">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link 
                href="/rate-my-listing"
                className="inline-block bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-xl"
              >
                🔥 Analyze Another Listing
              </Link>
              <p className="text-gray-400 text-sm mt-4">A copy of this report was also sent to your email</p>
            </div>
          </div>
        ) : null}

      </div>
    </main>
  );
}
