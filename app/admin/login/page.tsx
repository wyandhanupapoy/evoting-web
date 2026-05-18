'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading('Mencoba masuk...');

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      toast.success('Login berhasil!', { id: loadingToast });
      
      // Arahkan ke dashboard jika sukses
      router.push('/admin/dashboard');
    } catch (error: unknown) {
      console.error('Login error:', error);
      toast.error('Email atau password salah!', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-gradient flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:py-8">
      <Toaster />
      <div className="w-full max-w-md rounded-2xl border border-teal-100 bg-white/95 p-5 shadow-md sm:p-8">
        <div className="mb-6 text-center sm:mb-8">
          <p className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            Admin Panel
          </p>
          <h1 className="mt-3 text-xl font-bold text-slate-800 sm:text-2xl">Admin Polban Stride</h1>
          <p className="mt-1 text-sm text-slate-500">Silakan login untuk memantau transaksi dan mengelola kandidat</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40"
              placeholder="admin@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full rounded-lg py-3 font-semibold text-white transition ${isLoading ? 'cursor-not-allowed bg-teal-300' : 'bg-teal-700 hover:bg-teal-800'}`}
          >
            {isLoading ? 'Memproses...' : 'Masuk ke Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}