"use client";
import { useState } from 'react';
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '@/lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = mode === 'signup' 
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);
      onSuccess(result.user);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered. Try signing in.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      onSuccess(result.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏢</div>
          <h2 className="text-2xl font-bold text-[#1a2b4a]">
            {mode === 'signup' ? 'Create Your Agent Vault' : 'Sign In to Agent Vault'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'signup' ? 'Save and manage all your listing analyses' : 'Access your saved listings'}
          </p>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition mb-4 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
            required
          />
          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c9a227] hover:bg-[#b8911f] text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'signup' ? (
            <>Already have an account? <button onClick={() => setMode('signin')} className="text-[#c9a227] font-semibold">Sign In</button></>
          ) : (
            <>Need an account? <button onClick={() => setMode('signup')} className="text-[#c9a227] font-semibold">Sign Up</button></>
          )}
        </p>
      </div>
    </div>
  );
}
