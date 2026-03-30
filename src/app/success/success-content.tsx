'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface TransactionData {
  squarePaymentId: string;
  squareOrderId?: string;
  amount: number;
  credits?: number;
  packageType: string;
  status: string;
  userId?: string;
}

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 5000;

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Square returns these two params on redirect — that is all we need
    const squarePaymentId = searchParams.get('transactionId');
    const squareOrderId = searchParams.get('orderId');

    console.log(`[Success] squarePaymentId=${squarePaymentId} squareOrderId=${squareOrderId}`);

    if (!squarePaymentId && !squareOrderId) {
      setStatus('error');
      setErrorMsg('No transaction ID found. Please contact support.');
      return;
    }

    const callValidate = async (attempt: number): Promise<boolean> => {
      try {
        const params = new URLSearchParams();
        if (squarePaymentId) params.append('transactionId', squarePaymentId);
        if (squareOrderId) params.append('orderId', squareOrderId);

        console.log(`[Success] Attempt ${attempt}/${MAX_RETRIES}`);

        const response = await fetch(
          `/api/credits/validate-transaction?${params.toString()}`
        );

        const data = await response.json();

        if (response.ok && data?.success && data?.transaction) {
          setStatus('success');
          setTransactionData(data.transaction);
          return true;
        }

        return false;
      } catch (err) {
        console.error(`[Success] Attempt ${attempt} error:`, err);
        return false;
      }
    };

    const runRetryLoop = async () => {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        setRetryCount(attempt);
        const found = await callValidate(attempt);
        if (found) return;

        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }

      // All 5 attempts failed
      setStatus('error');
      setErrorMsg(
        'Your payment was received but confirmation is taking longer than expected. ' +
        'Your credits will appear within 5 minutes. Contact support if they do not.'
      );
    };

    runRetryLoop();
  }, [searchParams]);

  const getNextAction = () => {
    if (!transactionData) return null;
    const { packageType, credits } = transactionData;

    if (['monthly', 'annual', 'semi-annual', 'elite-annual'].includes(packageType)) {
      return {
        title: 'Your Membership is Active',
        description: 'You now have full access to Agent Vault and workspace tools.',
        primaryAction: { label: 'Go to Agent Vault', href: '/agent-vault' },
        secondaryAction: { label: 'Start Workspace', href: '/workspace' },
      };
    }

    if (packageType === 'vault-only') {
      return {
        title: 'Vault Access Unlocked',
        description: 'You can now save and organize all your listings and reports.',
        primaryAction: { label: 'Open Agent Vault', href: '/agent-vault' },
        secondaryAction: { label: 'Back to Home', href: '/' },
      };
    }

    if (packageType === 'fsbo-launch') {
      return {
        title: '100 Credits Added!',
        description: 'Your FSBO Launch Package is active. Start with Rate My Listing.',
        primaryAction: { label: 'Rate My Listing', href: '/rate-my-listing' },
        secondaryAction: { label: 'Go to Workspace', href: '/workspace' },
      };
    }

    if (['agent-verified', 'company-verified', 'verify-my-agent', 'verified-buyer-seller', 'reverification'].includes(packageType)) {
      return {
        title: 'Verification Complete',
        description: 'Your verified badge has been applied to your profile.',
        primaryAction: { label: 'View Profile', href: '/agent-vault' },
        secondaryAction: { label: 'Back to Home', href: '/' },
      };
    }

    if (['single', '5pack', 'credit'].includes(packageType)) {
      return {
        title: `${credits || 0} Credits Added!`,
        description: 'Ready to analyze listings and pull property data.',
        primaryAction: { label: 'Rate My Listing', href: '/rate-my-listing' },
        secondaryAction: { label: 'Agent Vault', href: '/agent-vault' },
      };
    }

    return {
      title: 'Purchase Complete',
      description: 'Thank you for your purchase.',
      primaryAction: { label: 'Go to Workspace', href: '/workspace' },
      secondaryAction: { label: 'Home', href: '/' },
    };
  };

  const nextAction = getNextAction();

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* LOADING */}
        {status === 'loading' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c9a227]/30 border-t-[#c9a227]"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Confirming Payment</h2>
            <p className="text-gray-300">
              {retryCount <= 1
                ? 'Please wait while we confirm your transaction...'
                : `Still confirming... (${retryCount}/${MAX_RETRIES})`}
            </p>
          </div>
        )}

        {/* SUCCESS */}
        {status === 'success' && transactionData && nextAction && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-bounce">✅</div>
              <h1 className="text-4xl font-bold text-white mb-2">Payment Successful!</h1>
              <p className="text-gray-300 text-lg">Your purchase has been processed.</p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
              <h3 className="text-[#c9a227] font-bold text-sm uppercase tracking-wide mb-4">
                Order Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Transaction ID</span>
                  <span className="text-white font-mono text-sm break-all">
                    {transactionData.squarePaymentId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amount Paid</span>
                  <span className="text-white font-bold text-lg">
                    ${(transactionData.amount / 100).toFixed(2)}
                  </span>
                </div>
                {transactionData.credits !== undefined && transactionData.credits > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Credits Added</span>
                    <span className="text-[#c9a227] font-bold">{transactionData.credits}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Plan</span>
                  <span className="text-white capitalize">{transactionData.packageType}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 mb-8">
              <p className="text-blue-200 text-sm">
                <strong>Payment confirmed.</strong> Your account has been updated.
              </p>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">{nextAction.title}</h2>
              <p className="text-gray-300">{nextAction.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href={nextAction.primaryAction.href}
                className="bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-4 rounded-xl font-bold text-lg transition text-center block"
              >
                {nextAction.primaryAction.label}
              </Link>
              <Link
                href={nextAction.secondaryAction.href}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-xl font-bold text-lg transition text-center block border border-white/20"
              >
                {nextAction.secondaryAction.label}
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-gray-400 text-sm text-center">
                Questions? Contact us at{' '}
                <a href="mailto:idxrealty@gmail.com" className="text-[#c9a227] hover:text-[#e8c547]">
                  idxrealty@gmail.com
                </a>
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {status === 'error' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-red-500/30">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-red-400 mb-2">Confirmation Delayed</h1>
              <p className="text-gray-300">{errorMsg}</p>
            </div>

            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-8">
              <p className="text-red-200 text-sm">
                <strong>If you were charged</strong>, your credits will appear within 5 minutes.
                Contact support if they do not arrive.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/"
                className="bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-4 rounded-xl font-bold text-lg transition text-center block"
              >
                Back to Home
              </Link>
              <a
                href="mailto:idxrealty@gmail.com"
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-xl font-bold text-lg transition text-center block border border-white/20"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
