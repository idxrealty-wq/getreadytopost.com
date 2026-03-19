'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PendingVerificationCard from '@/components/verification/PendingVerificationCard';

export default function PendingVerificationPage() {
  const router = useRouter();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        const response = await fetch('/api/verification/status');
        const data = await response.json();
        setVerifications(data.verifications || []);
      } catch (error) {
        console.error('Failed to fetch verifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifications();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Pending Verifications</h1>
        <p className="text-gray-600 mb-8">Track the status of your verification requests</p>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading verifications...</p>
          </div>
        ) : verifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No pending verifications yet.</p>
            <button
              onClick={() => router.push('/verification')}
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Start Verification
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {verifications.map((verification, index) => (
              <PendingVerificationCard
                key={index}
                submittedDate={verification.submittedDate ? new Date(verification.submittedDate) : undefined}
                verificationDeadline={verification.verificationDeadline ? new Date(verification.verificationDeadline) : undefined}
                status={verification.status}
                denialReason={verification.denialReason}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
