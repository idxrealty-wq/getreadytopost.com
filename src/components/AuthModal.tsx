"use client";

import { useEffect, useState } from 'react';
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { createUserProfile, getUserProfile } from '@/lib/profile';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
  mode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, onSuccess, mode: initialMode }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode || 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [designations, setDesignations] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'signup');
      setError('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      let user: any;

      if (mode === 'signup') {
        user = await signUpWithEmail(email, password);
        await createUserProfile(user.uid, {
          fullName,
          company,
          designations,
          email,
        });
      } else {
        user = await signInWithEmail(email, password);
        await getUserProfile(user.uid);
      }

      onSuccess?.(user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const user: any = await signInWithGoogle();
      // Ensure profile exists (don’t overwrite if it already does)
      await getUserProfile(user.uid).catch(async () => {
        await createUserProfile(user.uid, {
          fullName: user?.displayName || '',
          company: '',
          designations: '',
          email: user?.email || '',
        });
      });

      onSuccess?.(user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-[#1a2b4a]">
            {mode === 'signup' ? 'Create your account' : 'Sign in'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {mode === 'signup' && (
            <>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company (optional)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
              <input
                value={designations}
                onChange={(e) => setDesignations(e.target.value)}
                placeholder="Designations (optional)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </>
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full rounded-lg bg-[#c9a227] hover:bg-[#b8911f] text-white font-bold py-2 transition disabled:opacity-60"
          >
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold py-2 transition disabled:opacity-60"
          >
            Continue with Google
          </button>

          <p className="text-sm text-gray-600 text-center pt-2">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
              className="text-[#1a2b4a] font-bold hover:underline"
            >
              {mode === 'signup' ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
