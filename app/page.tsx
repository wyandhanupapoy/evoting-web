import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { formatRupiah, siteContent } from '@/utils/site-content';

// Mengambil indikator waktu agar halaman tidak di-cache statis sepenuhnya
export const revalidate = 0;

export default async function Home() {
  // Fetch data kandidat dari Supabase
  const { data: candidates, error } = await supabase
    .from('candidates')
    .select('*')
    .order('name', { ascending: true });

  const { data: votePriceSetting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'vote_price')
    .maybeSingle();

  const configuredVotePrice = (() => {
    const parsed = Number(votePriceSetting?.value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : siteContent.votePrice;
  })();

  if (error) {
    return <div className="px-4 py-10 text-center text-red-500">Gagal memuat data kandidat.</div>;
  }

  return (
    <main className="app-gradient min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-2xl border border-teal-100/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm sm:mb-10 sm:p-7">
          <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            {siteContent.heroBadge}
          </div>
          <h1 className="mt-4 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">{siteContent.heroTitle}</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">{siteContent.heroSubtitle}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-lg bg-teal-900 px-3 py-2 font-semibold text-white">1 transaksi = 1 vote valid</span>
            <span className="rounded-lg bg-white px-3 py-2 font-semibold text-teal-700 ring-1 ring-teal-100">{formatRupiah(configuredVotePrice)} per vote</span>
          </div>
        </header>

        <section className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold text-slate-800 sm:text-xl">{siteContent.candidateSectionTitle}</h2>
          <p className="text-xs text-slate-500 sm:text-sm">{candidates?.length || 0} kandidat aktif</p>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {candidates?.map((candidate, index) => (
            <article key={candidate.id} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              {/* Jika ada gambar, tampilkan di sini */}
              <div className="relative flex h-44 w-full items-center justify-center overflow-hidden bg-slate-200 sm:h-48">
                <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  #{index + 1}
                </span>
                {candidate.image_url ? (
                  <img src={candidate.image_url} alt={candidate.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-slate-500">Foto belum tersedia</span>
                )}
              </div>
              
              <div className="p-4 sm:p-5">
                <h3 className="mb-2 text-lg font-semibold text-slate-900 sm:text-xl">{candidate.name}</h3>
                <p className="mb-4 line-clamp-2 text-sm text-slate-600">{candidate.description}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-700 sm:text-base">
                    {candidate.vote_count} {siteContent.voteUnitLabel}
                  </span>
                  <Link 
                    href={`/vote/${candidate.id}`}
                    className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-teal-800 sm:px-4"
                  >
                    {siteContent.voteButtonLabel}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}