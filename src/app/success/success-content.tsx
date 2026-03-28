'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface TransactionData {
  checkoutId: string;
  amount: number;
  credits?: number;
  packageType: string;
  planId?: string;
  status: string;
  vaultAccess?: boolean;
  workspaceAccess?: boolean;
  renewalDate?: string;
  billingCycle?: string;
}

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const validateTransaction = async () => {
      let checkoutId =
        searchParams.get('checkoutId') ||
        searchParams.get('transactionId') ||
        searchParams.get('orderId');

      let tier = searchParams.get('tier');
      let userId = searchParams.get('userId');

      if (!checkoutId && typeof window !== 'undefined') {
        checkoutId = localStorage.getItem('checkoutId');
        tier = tier || localStorage.getItem('checkoutPackageType');
        userId = userId || localStorage.getItem('checkoutUserId');
      }

      if (!checkoutId) {
        setStatus('error');
        setErrorMsg('No transaction ID found. Please contact support.');
        return;
      }

      try {
        const params = new URLSearchParams({
          checkoutId: checkoutId || '',
          ...(tier && { tier }),
          ...(userId && { userId }),
        });

        const response = await fetch(`/api/credits/validate-transaction?${params.toString()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();

        if (response.ok && data?.success && data?.transaction) {
          setStatus('success');
          setTransactionData(data.transaction);

          if (typeof window !== 'undefined') {
            localStorage.removeItem('checkoutId');
            localStorage.removeItem('checkoutPackageType');
            localStorage.removeItem('checkoutUserId');
          }
        } else {
          setStatus('error');
          setErrorMsg(
            data?.message || 'Transaction not found or not yet processed. Please try again in a few moments.'
          );
        }
      } catch (err) {
        console.error('Validation error:', err);
        setStatus('error');
        setErrorMsg('Error validating transaction. Please try again.');
      }
    };

    validateTransaction();
  }, [searchParams]);

  const getNextAction = () => {
    if (!transactionData) return null;

    const { packageType, credits } = transactionData;

    if (
      packageType === 'monthly' ||
      packageType === 'annual' ||
      packageType === 'semi-annual' ||
      packageType === 'elite-annual'
    ) {
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

    if (packageType === 'credit' || packageType === '5pack' || packageType === 'single') {
      return {
        title: `${credits || 0} Credits Added!`,
        description: 'Ready to analyze listings and pull property data.',
        primaryAction: { label: 'Rate My Listing', href: '/' },
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
        {status === 'loading' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c9a227]/30 border-t-[#c9a227]"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Validating Payment</h2>
            <p className="text-gray-300">Please wait while we confirm your transaction...</p>
          </div>
        )}

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
                  <span className="text-white font-mono text-sm break-all">{transactionData.checkoutId}</span>
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
                {transactionData.renewalDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Renewal Date</span>
                    <span className="text-white">
                      {new Date(transactionData.renewalDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {transactionData.vaultAccess && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Agent Vault</span>
                    <span className="text-green-400 font-bold">✓ Unlocked</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 mb-8">
              <p className="text-blue-200 text-sm">
                <strong>Payment confirmed.</strong> Your account access and purchase details have been updated.
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
                <a
                  href="mailto:idxrealty@gmail.com"
                  className="text-[#c9a227] hover:text-[#e8c547]"
                >
                  idxrealty@gmail.com
                </a>
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-red-500/30">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-4xl font-bold text-red-400 mb-2">Payment Issue</h1>
              <p className="text-gray-300 text-lg">{errorMsg}</p>
            </div>

            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-8">
              <p className="text-red-200 text-sm">
                <strong>If you were charged</strong>, your transaction will be processed shortly. If the issue
                persists, please contact support.
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
