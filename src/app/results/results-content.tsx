"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, User } from '@/lib/auth';
import { onAuthStateChanged } from 'firebase/auth';
import AuthModal from '@/components/AuthModal';

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
  userId?: string;
  savedToVault?: boolean;
}

const gradeColors: Record<string, string> = {
  'A+': 'from-green-400 to-emerald-600',
  A: 'from-green-400 to-emerald-600',
  B: 'from-blue-400 to-blue-600',
  C: 'from-yellow-400 to-orange-500',
  D: 'from-red-400 to-red-600',
};

const gradeBarWidth: Record<string, string> = {
  'A+': 'w-[100%]',
  A: 'w-[95%]',
  B: 'w-[75%]',
  C: 'w-[50%]',
  D: 'w-[25%]',
};

const gradeBg: Record<string, string> = {
  'A+': 'bg-green-500',
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
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSignUpBanner, setShowSignUpBanner] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!submissionId) return;
    const unsubscribe = onSnapshot(doc(db, 'submissions', submissionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Submission;
        setSubmission(data);
        if (data.status === 'completed' && data.analysis) {
          setLoading(false);
          setTimeout(() => setRevealed(true), 300);
          // Show sign-up banner after 3 seconds if not signed in
          setTimeout(() => setShowSignUpBanner(true), 3000);
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

  const handleSaveToVault = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    await saveToVault(user);
  };

  const saveToVault = async (currentUser: User) => {
    if (!submissionId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'submissions', submissionId), {
        userId: currentUser.uid,
        savedToVault: true,
        savedAt: new Date().toISOString(),
      });
      setSubmission(prev => prev ? { ...prev, userId: currentUser.uid, savedToVault: true } : null);
      setShowSignUpBanner(false);
    } catch (error) {
      console.error('Error saving to vault:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAuthSuccess = async (currentUser: User) => {
    setShowAuthModal(false);
    await saveToVault(currentUser);
  };

  if (!submissionId) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">No submission found</h1>
          <Link href="/rate-my-listing" className="text-[#c9a227] hover:underline">Go to Rate My Listing</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main
        className="pt-20 min-h-screen relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2b4a]/95 via-[#2d4a7c]/95 to-[#1a2b4a]/95"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block mb-8">
                <div className="w-20 h-20 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Analyzing Your Listing...</h2>
              <p className="text-gray-300 text-lg mb-2">Our AI is grading your listing across 6 categories</p>
              <p className="text-gray-400 mb-8">This usually takes 30-60 seconds after payment</p>
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20 max-w-md mx-auto">
                <p className="text-white font-bold mb-2">⏳ Waiting for payment confirmation...</p>
                <p className="text-gray-400 text-sm">This page will automatically update once your payment is confirmed and your report is ready.</p>
              </div>
            </div>
          ) : submission?.analysis ? (
            <div className={`transition-all duration-1000 \${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

              {/* Post-payment sign-up banner - shows after 3 seconds if not signed in */}
              {!user && showSignUpBanner && !submission.savedToVault && (
                <div className="fixed bottom-6 left-0 right-0 z-50 px-6">
                  <div className="max-w-2xl mx-auto bg-gradient-to-r from-[#c9a227] to-[#b8911f] rounded-2xl p-5 shadow-2xl border-2 border-white/20">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">🎉</div>
                        <div>
                          <p className="text-white font-bold">Your report is ready! Save it to your vault.</p>
                          <p className="text-white/80 text-sm">Create a free account to access it anytime.</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => setShowAuthModal(true)}
                          className="bg-white text-[#c9a227] px-5 py-2 rounded-xl font-bold text-sm hover:bg-gray-100 transition whitespace-nowrap"
                        >
                          Save to Vault →
                        </button>
                        <button
                          onClick={() => setShowSignUpBanner(false)}
                          className="text-white/60 hover:text-white text-xl px-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vault save prompt - top of page */}
              {!submission.savedToVault ? (
                <div className="bg-gradient-to-r from-[#1a2b4a] to-[#2d4a7c] border-2 border-[#c9a227]/60 rounded-2xl p-6 mb-8 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="text-5xl">💼</div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {user ? 'Save This Report to Your Vault' : '🎉 Your Report is Ready — Save It!'}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {user
                          ? 'Add this analysis to your Agent Vault to access it anytime.'
                          : 'Create your free Agent Vault account to save this report, access it anytime, and store all future listings.'}
                      </p>
                    </div>
                    <button
                      onClick={handleSaveToVault}
                      disabled={saving}
                      className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold text-lg transition disabled:opacity-50 whitespace-nowrap shadow-xl"
                    >
                      {saving ? 'Saving...' : user ? '💾 Save to My Vault' : '🚀 Create Free Account & Save'}
                    </button>
                  </div>
                  {!user && (
                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white/5 rounded-lg p-2 text-xs text-gray-300">✅ Free account</div>
                      <div className="bg-white/5 rounded-lg p-2 text-xs text-gray-300">🗄️ Agent Vault access</div>
                      <div className="bg-white/5 rounded-lg p-2 text-xs text-gray-300">📊 All future reports saved</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-green-500/20 border-2 border-green-500/40 rounded-xl p-4 mb-8 text-center">
                  <p className="text-green-300 font-semibold">✅ Saved to your Agent Vault! <Link href="/vault" className="underline hover:text-white">View Vault →</Link></p>
                </div>
              )}

              {/* Grade */}
              <div className="text-center mb-10">
                <p className="text-[#c9a227] font-semibold text-sm uppercase tracking-widest mb-2">Your Listing Grade</p>
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br \${gradeColors[submission.analysis.overall] || gradeColors['C']} shadow-2xl mb-4`}>
                  <span className="text-6xl font-black text-white">{submission.analysis.overall}</span>
                </div>
              </div>

              {/* Category breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {Object.entries(submission.analysis.categories).map(([key, val], i) => (
                  <div
                    key={key}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-xl transition-all duration-500"
                    style={{ transitionDelay: `\${i * 150}ms`, opacity: revealed ? 1 : 0 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{categoryLabels[key] || key}</span>
                      <span className={`text-lg font-black px-3 py-1 rounded-lg \${gradeBg[val.grade]} text-white`}>{val.grade}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                      <div className={`h-2 rounded-full \${gradeBg[val.grade]} \${gradeBarWidth[val.grade]} transition-all duration-1000`}></div>
                    </div>
                    <p className="text-gray-300 text-sm">{val.feedback}</p>
                  </div>
                ))}
              </div>

              {/* Rewrite */}
              <div className="bg-gradient-to-br from-emerald-900/60 to-green-900/40 backdrop-blur-md rounded-2xl p-8 border-2 border-emerald-500/40 shadow-2xl mb-10 relative">
                <div className="absolute top-4 left-4 bg-red-500 text-white px-5 py-2 rounded-lg font-black text-2xl shadow-2xl transform -rotate-6">A+</div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white ml-20">✨ Your Professional Rewrite</h2>
                  <button
                    onClick={copyRewrite}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-lg"
                  >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <p className="text-white text-lg leading-relaxed">{submission.analysis

cat >> src/app/results/results-content.tsx << 'EOF'
.rewrite}</p>
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

              {/* Bottom CTA */}
              <div className="text-center mb-20">
                <Link href="/rate-my-listing" className="inline-block bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-xl">
                  Analyze Another Listing
                </Link>
                {user && (
                  <Link href="/vault" className="inline-block ml-4 bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-xl">
                    My Agent Vault
                  </Link>
                )}
                <p className="text-gray-400 text-sm mt-4">A copy of this report was also sent to your email</p>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
