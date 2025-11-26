'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { FaYoutube, FaGoogle } from 'react-icons/fa';
import { IoEye, IoEyeOff } from 'react-icons/io5';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      setError('Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-8">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <FaYoutube className="w-10 h-10 text-[#FF0000]" />
          <span className="text-2xl font-bold text-[#111111]">YouTube</span>
        </Link>

        <h1 className="text-2xl font-semibold text-[#111111] text-center mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-[#555555] text-center mb-8">
          Sign in to continue to YouTube
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full h-12 flex items-center justify-center gap-3 bg-white border-2 border-[#ECECEC] rounded-xl font-medium text-[#111111] hover:bg-[#F6F6F6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          <FaGoogle className="w-5 h-5 text-[#4285F4]" />
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#ECECEC]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-[#999999]">or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#111111] mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-[#F6F6F6] rounded-xl text-[#111111] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#111111] mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 pr-12 bg-[#F6F6F6] rounded-xl text-[#111111] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#555555]"
              >
                {showPassword ? <IoEyeOff className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#FF0000] text-white font-medium rounded-xl hover:bg-[#CC0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#555555]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#FF0000] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
