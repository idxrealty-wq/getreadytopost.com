"use client";
import { useState } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } from '@/lib/auth';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const result = await signInWithGoogle();
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to sign in with Google');
    }
    setLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'reset') {
      const result = await resetPassword(email);
      if (result.success) {
        setSuccess('Password reset email sent! Check your inbox.');
        setEmail('');
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } else if (mode === 'signup') {
      const result = await signUpWithEmail(email, password);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to create account');
      }
    } else {
      const result = await signInWithEmail(email, password);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to sign in');
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2">
          {mode === 'signin' && 'Sign In to GetReadyToPost'}
          {mode === 'signup' && 'Create Your Account'}
          {mode === 'reset' && 'Reset Password'}
        </h2>
        <p className="text-gray-600 mb-6">
          {mode === 'signin' && 'Sign in to save your listings and access all features.'}
          {mode === 'signup' && 'Create a free account to get started.'}
          {mode === 'reset' && 'Enter your email to receive a password reset link.'}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>🔵</span> Sign In with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#c9a227] focus:outline-none"
            />
            {mode !== 'reset' && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#c9a227] focus:outline-none"
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign In with Email' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>
        </div>

        <div className="text-center space-y-2">
          {mode === 'signin' && (
            <>
              <button
                onClick={() => setMode('signup')}
                className="text-[#c9a227] hover:underline font-medium"
              >
                Don't have an account? Sign up
              </button>
              <br />
              <button
                onClick={() => setMode('reset')}
                className="text-gray-600 hover:underline text-sm"
              >
                Forgot password?
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button
              onClick={() => setMode('signin')}
              className="text-[#c9a227] hover:underline font-medium"
            >
              Already have an account? Sign in
            </button>
          )}
          {mode === 'reset' && (
            <button
              onClick={() => setMode('signin')}
              className="text-[#c9a227] hover:underline font-medium"
            >
              Back to sign in
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 text-gray-600 hover:text-gray-800 font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
