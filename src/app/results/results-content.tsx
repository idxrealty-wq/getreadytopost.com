'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface Submission {
  listingText: string;
  analysis?: any;
  status: string;
  saved?: boolean;
  email?: string;
}

const gradeColor = (grade: string): string => {
  const g = String(grade).toUpperCase();
  if (g === 'A') return '#10b981';
  if (g === 'B') return '#f59e0b';
  if (g === 'C') return '#ef4444';
  if (g === 'D') return '#dc2626';
  if (g === 'F') return '#6b7280';
  return '#9ca3af';
};

const gradeLabel = (grade: string): string => {
  const g = String(grade).toUpperCase();
  if (g === 'A') return 'Excellent';
  if (g === 'B') return 'Good';
  if (g === 'C') return 'Fair';
  if (g === 'D') return 'Poor';
  if (g === 'F') return 'Incomplete';
  return 'Unknown';
};

const getRecommendations = (analysis: any): string[] => {
  if (analysis?.recommendations && Array.isArray(analysis.recommendations)) {
    return analysis.recommendations;
  }
  if (analysis?.rewrite?.recommendations && Array.isArray(analysis.rewrite.recommendations)) {
    return analysis.rewrite.recommendations;
  }
  return [];
};

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const submissionId = searchParams.get('id');
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'grades' | 'rewrite' | 'recommendations'>('grades');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!submissionId) return;
    const fetchSubmission = async () => {
      try {
        const docRef = doc(db, 'submissions', submissionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSubmission(docSnap.data() as Submission);
        }
      } catch (error) {
        console.error('Error fetching submission:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId]);

  const handleCopyRewrite = () => {
    const text = getRewriteText();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadRewrite = () => {
    const text = getRewriteText();
    if (!text || !submissionId) return;
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `rewrite-${submissionId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveToVault = async () => {
    if (!submissionId) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'submissions', submissionId);
      await updateDoc(docRef, { saved: true, savedAt: new Date().toISOString() });
      setSubmission((prev) => (prev ? { ...prev, saved: true } : null));
    } catch (e) {
      console.error('Save error:', e);
    } finally {
      setSaving(false);
    }
  };

  const getOriginalGrade = (): string => {
    const analysis = submission?.analysis;
    return String(analysis?.original?.overall?.grade ?? analysis?.overall ?? '—').toUpperCase();
  };

  const getOriginalScore = (): number | null => {
    const analysis = submission?.analysis;
    return analysis?.original?.overall?.score ?? null;
  };

  const getRewriteGrade = (): string => {
    const analysis = submission?.analysis;
    return String(analysis?.rewrite?.overall?.grade ?? analysis?.rewriteGrade ?? '—').toUpperCase();
  };

  const getRewriteText = (): string => {
    const analysis = submission?.analysis;
    return String(analysis?.rewrite?.text ?? analysis?.rewrite ?? '');
  };

  const getRewriteWordCount = (): number => {
    const analysis = submission?.analysis;
    return analysis?.rewrite?.wordCount ?? analysis?.rewriteWordCount ?? 0;
  };

  const getOriginalBreakdown = (): Record<string, any> => {
    const analysis = submission?.analysis;
    return analysis?.original?.breakdown ?? analysis?.categories ?? {};
  };

  const getRewriteBreakdown = (): Record<string, any> => {
    const analysis = submission?.analysis;
    return analysis?.rewrite?.breakdown ?? analysis?.rewriteCategories ?? {};
  };
  if (loading) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your results...</p>
        </div>
      </main>
    );
  }

  if (!submissionId || !submission || !submission.analysis) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Report Not Found</h2>
          <p className="text-gray-300 mb-6">We couldn't find your analysis. Please try again.</p>
          <Link href="/" className="text-[#c9a227] hover:text-[#e8c547] font-bold">Back to Home</Link>
        </div>
      </main>
    );
  }

  const originalGrade = getOriginalGrade();
  const originalScore = getOriginalScore();
  const rewriteGrade = getRewriteGrade();
  const rewriteText = getRewriteText();
  const rewriteWordCount = getRewriteWordCount();
  const originalBreakdown = getOriginalBreakdown();
  const rewriteBreakdown = getRewriteBreakdown();
  const recommendations = getRecommendations(submission.analysis);

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Your Listing Analysis</h1>
          <p className="text-gray-300 text-lg">Review your grades and MLS-ready rewrite below.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-8">
            <div className="flex items-center gap-6">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-white font-bold text-5xl shadow-lg"
                style={{ backgroundColor: gradeColor(originalGrade) }}
              >
                {originalGrade}
              </div>
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide mb-1">Original Grade</p>
                <p className="text-white text-2xl font-bold">{gradeLabel(originalGrade)}</p>
                {originalScore !== null && <p className="text-gray-300 text-sm mt-1">Score: {originalScore}/100</p>}
              </div>
            </div>

            <div className="hidden md:flex justify-center">
              <div className="text-[#c9a227] text-4xl">→</div>
            </div>

            <div className="flex items-center gap-6">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-white font-bold text-5xl shadow-lg"
                style={{ backgroundColor: gradeColor(rewriteGrade) }}
              >
                {rewriteGrade}
              </div>
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide mb-1">Rewrite Grade</p>
                <p className="text-white text-2xl font-bold">{gradeLabel(rewriteGrade)}</p>
                <p className="text-gray-300 text-sm mt-1">{rewriteWordCount} words</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setCurrentTab('grades')}
              className={`px-6 py-3 rounded-xl font-bold transition ${
                currentTab === 'grades'
                  ? 'bg-[#c9a227] text-[#1a2b4a]'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Grades
            </button>
            <button
              onClick={() => setCurrentTab('rewrite')}
              className={`px-6 py-3 rounded-xl font-bold transition ${
                currentTab === 'rewrite'
                  ? 'bg-[#c9a227] text-[#1a2b4a]'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Rewrite
            </button>
            <button
              onClick={() => setCurrentTab('recommendations')}
              className={`px-6 py-3 rounded-xl font-bold transition ${
                currentTab === 'recommendations'
                  ? 'bg-[#c9a227] text-[#1a2b4a]'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Next Steps
            </button>
          </div>
        </div>
        {currentTab === 'grades' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-10">
            <h2 className="text-3xl font-bold text-white mb-8">Original Listing Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(originalBreakdown).map(([key, data]: [string, any]) => (
                <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#c9a227]/50 transition">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white capitalize text-lg">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: gradeColor(data.grade) }}
                    >
                      {data.grade}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {data.feedback || data.auditTrail || 'No details available.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'rewrite' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">MLS-Ready Rewrite</h2>
                <p className="text-gray-300">Copy, download, or save to your vault.</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm uppercase tracking-wide mb-1">Word Count</p>
                <p className="text-4xl font-bold text-[#c9a227]">{rewriteWordCount}</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
              <p className="text-white text-lg leading-relaxed whitespace-pre-wrap font-serif">{rewriteText}</p>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={handleCopyRewrite}
                className="px-6 py-3 bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] rounded-xl font-bold transition"
              >
                {copied ? '✓ Copied!' : 'Copy Rewrite'}
              </button>
              <button
                onClick={handleDownloadRewrite}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition border border-white/20"
              >
                Download TXT
              </button>
              <button
                onClick={handleSaveToVault}
                disabled={saving || submission.saved}
                className={`px-6 py-3 rounded-xl font-bold transition ${
                  submission.saved
                    ? 'bg-green-600/30 text-green-300 border border-green-500/40 cursor-default'
                    : 'bg-green-600/30 hover:bg-green-600/50 text-green-300 border border-green-500/40'
                }`}
              >
                {saving ? 'Saving...' : submission.saved ? '✓ Saved to Vault' : 'Save to Vault'}
              </button>
            </div>

            {Object.keys(rewriteBreakdown).length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Rewrite Category Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(rewriteBreakdown).map(([key, data]: [string, any]) => (
                    <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: gradeColor(data.grade) }}
                        >
                          {data.grade}
                        </div>
                      </div>
                      <p className="text-gray-300 text-xs">{data.feedback || data.auditTrail || ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'recommendations' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-10">
            <h2 className="text-3xl font-bold text-white mb-8">Next Steps</h2>
            {recommendations.length > 0 ? (
              <div className="space-y-4 mb-10">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-6 flex gap-4">
                    <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">{idx + 1}</div>
                    <p className="text-white text-lg leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-300 mb-10">No specific recommendations at this time.</p>
            )}

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mb-8">
              <h3 className="text-white font-bold mb-3">What's Next?</h3>
              <p className="text-blue-200 text-sm mb-4">
                You've analyzed this listing. Now it's time to take action and scale your business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/agent-vault"
                className="bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-4 rounded-xl font-bold text-center transition block"
              >
                Go to Agent Vault
              </Link>
              <Link
                href="/"
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-xl font-bold text-center transition block border border-white/20"
              >
                Analyze Another Listing
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
