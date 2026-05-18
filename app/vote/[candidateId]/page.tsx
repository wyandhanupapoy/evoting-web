'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { formatRupiah, siteContent } from '@/utils/site-content';

type Candidate = {
  name: string;
};

type Snap = {
  pay: (
    token: string,
    options: {
      onSuccess: () => void;
      onPending: () => void;
      onError: () => void;
      onClose: () => void;
    }
  ) => void;
};

export default function VoteForm({ params }: { readonly params: Promise<{ candidateId: string }> }) {
  const router = useRouter();
  const { candidateId } = use(params);

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votePrice, setVotePrice] = useState(siteContent.votePrice);
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';

  // Load script Midtrans Snap saat halaman dimuat
  useEffect(() => {
    const snapScript = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    if (!clientKey) {
      toast.error('NEXT_PUBLIC_MIDTRANS_CLIENT_KEY belum diatur.');
      return;
    }

    const script = document.createElement('script');
    script.src = snapScript;
    script.dataset.clientKey = clientKey;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [isProduction]);

  useEffect(() => {
    const fetchVotePrice = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'vote_price')
        .maybeSingle();

      const parsed = Number(data?.value);
      if (Number.isFinite(parsed) && parsed > 0) {
        setVotePrice(parsed);
      }
    };

    const fetchCandidate = async () => {
      const { data } = await supabase
        .from('candidates')
        .select('name')
        .eq('id', candidateId)
        .single();
      if (data) setCandidate(data);
    };

    fetchVotePrice();
    fetchCandidate();
  }, [candidateId]);

  const handlePayment = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name) {
      toast.error('Silakan isi nama Anda terlebih dahulu!');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Menyiapkan QRIS...');

    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          candidateId,
          candidateName: candidate?.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal terhubung ke Midtrans');
      }

      const { token } = data;
      const snap = (globalThis as typeof globalThis & { snap?: Snap }).snap;

      if (!snap) {
        throw new Error('Layanan pembayaran belum siap. Coba beberapa detik lagi.');
      }

      toast.dismiss(loadingToast);

      snap.pay(token, {
        onSuccess: async () => {
          toast.success('Pembayaran Berhasil! Memproses vote...');

          await supabase.from('votes').insert([
            {
              voter_name: name,
              candidate_id: candidateId,
              status: 'approved',
              proof_url: 'Midtrans QRIS',
            },
          ]);

          await supabase.rpc('increment_vote', { cand_id: candidateId });

          toast.success('Vote berhasil ditambahkan!');
          setTimeout(() => router.push('/'), 2000);
        },
        onPending: () => {
          toast.success('Menunggu pembayaran QRIS...');
        },
        onError: () => {
          toast.error('Pembayaran gagal atau dibatalkan.');
          setIsSubmitting(false);
        },
        onClose: () => {
          setIsSubmitting(false);
        },
      });
    } catch (error: unknown) {
      toast.error(`Terjadi kesalahan: ${error instanceof Error ? error.message : 'Terjadi kesalahan.'}`, { id: loadingToast });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-gradient flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:py-8">
      <Toaster />
      <div className="soft-grid w-full max-w-md rounded-2xl border border-teal-100 bg-white p-5 shadow-md sm:p-8">
        <div className="mb-6 text-center">
          <p className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            Form Voting
          </p>
          <h1 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">{siteContent.voteFormTitle}</h1>
          <p className="mt-2 text-sm text-slate-600">{siteContent.voteFormDescription}</p>
        </div>

        <div className="mb-5 rounded-xl border border-slate-200 bg-white/85 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Kandidat Pilihan</p>
          <p className="mt-1 text-base font-semibold text-teal-700">{candidate?.name || 'Memuat...'}</p>
          <p className="mt-1 text-xs text-slate-500">Biaya dukungan: {formatRupiah(votePrice)}</p>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label htmlFor="voter-name" className="mb-1 block text-sm font-medium text-slate-700">{siteContent.voteInputLabel}</label>
            <input 
              id="voter-name"
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50"
              placeholder={siteContent.voteInputPlaceholder}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition sm:text-base ${isSubmitting ? 'cursor-not-allowed bg-teal-300' : 'bg-teal-700 hover:bg-teal-800'}`}
          >
            {isSubmitting ? 'Memproses...' : `${siteContent.paymentButtonPrefix} (${formatRupiah(votePrice)})`}
          </button>
        </form>
      </div>
    </div>
  );
}