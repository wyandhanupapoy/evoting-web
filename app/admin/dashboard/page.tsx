'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { formatRupiah, siteContent } from '@/utils/site-content';

type VoteItem = {
  id: string;
  voter_name: string;
  status: string;
  created_at: string;
  candidates: { name: string }[] | null;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [votes, setVotes] = useState<VoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [votePrice, setVotePrice] = useState(siteContent.votePrice);
  const [priceInput, setPriceInput] = useState(String(siteContent.votePrice));
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  async function fetchVotePrice() {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'vote_price')
      .maybeSingle();

    const parsed = Number(data?.value);
    if (Number.isFinite(parsed) && parsed > 0) {
      setVotePrice(parsed);
      setPriceInput(String(parsed));
    }
  }

  // 2. Mengambil Semua Data Vote
  async function fetchVotes() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('votes')
      .select(`
        id, 
        voter_name, 
        status,
        created_at,
        candidates ( name )
      `)
      .order('created_at', { ascending: false }); // Urutkan dari yang terbaru

    if (error) {
      toast.error('Gagal memuat data riwayat.');
    } else {
      setVotes((data as VoteItem[]) || []);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    // 1. Pengecekan Sesi Login
    const checkSessionAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Tendang ke halaman login jika belum autentikasi
      if (!session) {
        router.push('/admin/login');
        return;
      }
      
      fetchVotePrice();
      fetchVotes();
    };

    checkSessionAndFetch();
  }, [router]);

  // 3. Fungsi Keluar (Logout)
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const handleSaveVotePrice = async () => {
    const parsed = Number(priceInput);
    if (!Number.isFinite(parsed) || parsed < 1000) {
      toast.error('Biaya vote minimal Rp1.000 dan harus berupa angka.');
      return;
    }

    setIsSavingPrice(true);
    const loadingToast = toast.loading('Menyimpan biaya vote...');

    try {
      const { error } = await supabase.from('app_settings').upsert(
        { key: 'vote_price', value: String(parsed) },
        { onConflict: 'key' }
      );

      if (error) throw error;

      setVotePrice(parsed);
      toast.success('Biaya vote berhasil diperbarui.', { id: loadingToast });
    } catch (error: unknown) {
      toast.error(
        `Gagal simpan biaya vote: ${error instanceof Error ? error.message : 'Terjadi kesalahan.'}`,
        { id: loadingToast }
      );
    } finally {
      setIsSavingPrice(false);
    }
  };

  // 4. Kalkulasi Keuangan
  const totalSukses = votes.filter(v => v.status === 'approved').length;
  const totalPendapatanKotor = totalSukses * votePrice;

  // Format tanggal dan waktu
  const formatWaktu = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };
  const getStatusStyle = (status: string) => {
    if (status === 'approved') return 'bg-emerald-100 text-emerald-700';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="app-gradient min-h-screen px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <Toaster />
      <div className="mx-auto max-w-6xl">
        
        {/* Header Dashboard */}
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-teal-100 bg-white/95 p-4 shadow-sm sm:mb-8 sm:p-6 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-auto">
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">{siteContent.adminDashboardTitle}</h1>
            <p className="mt-1 text-sm text-slate-500">{siteContent.adminDashboardSubtitle}</p>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:w-auto md:flex md:items-center md:gap-4">
            {/* Tombol ke Halaman Kelola Kandidat */}
            <button 
              onClick={() => router.push('/admin/candidates')}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Kelola Kandidat
            </button>
            <button 
              onClick={handleLogout}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-6">
          <div className="rounded-xl border-l-4 border-teal-500 bg-white p-4 shadow-sm sm:p-6">
            <p className="mb-1 text-xs font-semibold uppercase text-slate-500 sm:text-sm">Total Transaksi Sukses</p>
            <p className="text-2xl font-bold text-slate-800 sm:text-3xl">{totalSukses} <span className="text-sm font-normal text-slate-500 sm:text-base">Votes</span></p>
          </div>
          <div className="rounded-xl border-l-4 border-emerald-500 bg-white p-4 shadow-sm sm:p-6">
            <p className="mb-1 text-xs font-semibold uppercase text-slate-500 sm:text-sm">Estimasi Pemasukan Kotor</p>
            <p className="text-2xl font-bold text-emerald-600 sm:text-3xl">{formatRupiah(totalPendapatanKotor)}</p>
            <p className="mt-1 text-xs text-slate-400">*Belum dipotong biaya layanan (MDR) QRIS Midtrans 0.7%</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
          <h2 className="text-base font-bold text-slate-800 sm:text-lg">Pengaturan Biaya Vote</h2>
          <p className="mt-1 text-sm text-slate-500">Biaya ini dipakai otomatis di halaman publik dan di proses pembayaran Midtrans.</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label htmlFor="vote-price" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Biaya Per Vote (Rupiah)
              </label>
              <input
                id="vote-price"
                type="number"
                min={1000}
                step={500}
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40"
                placeholder="10000"
              />
              <p className="mt-1 text-xs text-slate-500">Biaya aktif saat ini: {formatRupiah(votePrice)}</p>
            </div>
            <button
              onClick={handleSaveVotePrice}
              disabled={isSavingPrice}
              className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-teal-400"
            >
              {isSavingPrice ? 'Menyimpan...' : 'Simpan Biaya'}
            </button>
          </div>
        </div>

        {/* Tabel Riwayat Transaksi */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 p-4 sm:p-6">
            <h2 className="text-lg font-bold text-slate-700">Riwayat Voting</h2>
          </div>
          
          <div className="p-4 sm:p-6 md:hidden">
            {isLoading && (
              <p className="py-6 text-center text-sm text-gray-500">Memuat data riwayat...</p>
            )}
            {!isLoading && votes.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-500">Belum ada transaksi yang masuk.</p>
            )}
            {!isLoading && votes.length > 0 && (
              <div className="space-y-3">
                {votes.map((vote, index) => (
                  <div key={vote.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-500">#{index + 1}</p>
                      <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusStyle(vote.status)}`}>
                        {vote.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{vote.voter_name}</p>
                    <p className="mt-1 text-sm text-teal-700">{vote.candidates?.[0]?.name || '-'}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatWaktu(vote.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            {isLoading && (
              <p className="text-center text-gray-500 py-10">Memuat data riwayat...</p>
            )}
            {!isLoading && votes.length === 0 && (
              <p className="text-center text-gray-500 py-10">Belum ada transaksi yang masuk.</p>
            )}
            {!isLoading && votes.length > 0 && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold border-b">No</th>
                    <th className="px-6 py-4 font-semibold border-b">Nama Voter</th>
                    <th className="px-6 py-4 font-semibold border-b">Kandidat Pilihan</th>
                    <th className="px-6 py-4 font-semibold border-b">Waktu Transaksi</th>
                    <th className="px-6 py-4 font-semibold border-b">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {votes.map((vote, index) => (
                    <tr key={vote.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-slate-600">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">{vote.voter_name}</td>
                      <td className="px-6 py-4 text-sm text-teal-700 font-medium">{vote.candidates?.[0]?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatWaktu(vote.created_at)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(vote.status)}`}>
  {vote.status.toUpperCase()}
</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}