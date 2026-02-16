import { Suspense } from 'react';
import ResultsContent from './results-content';

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading results...</p>
        </div>
      </main>
    }>
      <ResultsContent />
    </Suspense>
  );
}
