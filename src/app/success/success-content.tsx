'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [transactionData, setTransactionData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const validateTransaction = async () => {
      const checkoutId =
        searchParams.get('checkoutId') ||
        searchParams.get('transactionId') ||
        searchParams.get('orderId');

      const tier = searchParams.get('tier');

      if (!checkoutId) {
        setStatus('error');
        setErrorMsg('No transaction ID found. Please contact support.');
        return;
      }

      try {
        const response = await fetch('/api/credits/validate-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutId, tier }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setTransactionData(data.transaction);
        } else {
          setStatus('error');
          setErrorMsg(data.message || 'Transaction not found or not yet processed.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMsg('Error validating transaction. Please try again.');
        console.error('Validation error:', err);
      }
    };

    validateTransaction();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Validating your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-4">Your credits have been added to your account.</p>

            {transactionData && (
              <div className="bg-gray-50 rounded p-4 mb-6 text-left text-sm">
                <p className="mb-2">
                  <strong>Checkout ID:</strong> {transactionData.checkoutId}
                </p>
                <p className="mb-2">
                  <strong>Amount:</strong> ${(transactionData.amount / 100).toFixed(2)}
                </p>
                <p className="mb-2">
                  <strong>Credits Added:</strong> {transactionData.credits}
                </p>
                {transactionData.packageType && (
                  <p>
                    <strong>Package:</strong> {transactionData.packageType}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Link
                href="/workspace"
                className="flex-1 bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700"
              >
                Go to Workspace
              </Link>
              <Link
                href="/buy-credits"
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded font-semibold hover:bg-gray-300"
              >
                Buy More
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Issue</h1>
            <p className="text-gray-600 mb-4">{errorMsg}</p>
            <p className="text-sm text-gray-500 mb-6">
              If you were charged, contact support at <strong>idxrealty@gmail.com</strong>
            </p>
            <div className="flex gap-3">
              <Link
                href="/buy-credits"
                className="flex-1 bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded font-semibold hover:bg-gray-300"
              >
                Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
