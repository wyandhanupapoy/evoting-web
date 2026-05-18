'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { siteContent } from '@/utils/site-content';

type Candidate = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  vote_count: number;
};

export default function ManageCandidates() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [isLoading, setIsLoading] = useState(false);

  const maxImageBytes = siteContent.candidateImageMaxMb * 1024 * 1024;

  const validateImageDimensions = async (imageFile: File) => {
    const objectUrl = URL.createObjectURL(imageFile);

    try {
      const dimension = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => reject(new Error('Gagal membaca dimensi gambar.'));
        img.src = objectUrl;
      });

      if (dimension.width > siteContent.candidateImageMaxWidth || dimension.height > siteContent.candidateImageMaxHeight) {
        throw new Error(
          `Resolusi maksimum ${siteContent.candidateImageMaxWidth}x${siteContent.candidateImageMaxHeight}px.`
        );
      }
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  async function fetchCandidates() {
    const { data } = await supabase.from('candidates').select('*').order('name', { ascending: true });
    if (data) setCandidates(data as Candidate[]);
  }

  // Proteksi Halaman & Fetch Data
  useEffect(() => {
    const checkSessionAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }
      fetchCandidates();
    };
    checkSessionAndFetch();
  }, [router]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Tambah Kandidat Baru
  const handleAddCandidate = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !description) {
      toast.error('Nama dan deskripsi wajib diisi!');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Menambahkan kandidat...');

    try {
      let imageUrl = '';

      if (uploadMode === 'url' && imageUrlInput.trim()) {
        imageUrl = imageUrlInput.trim();
      }

      // Jika ada file foto yang diunggah
      if (uploadMode === 'file' && file) {
        if (!file.type.startsWith('image/')) {
          throw new Error('File harus berupa gambar.');
        }
        if (file.size > maxImageBytes) {
          throw new Error(`Ukuran gambar maksimal ${siteContent.candidateImageMaxMb} MB.`);
        }

        await validateImageDimensions(file);

        const fileExt = file.name.split('.').pop();
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const fileName = `${Date.now()}-${slug || 'candidate'}.${fileExt}`;
        const filePath = `candidates/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('candidate-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('candidate-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // Insert ke database
      const { error } = await supabase.from('candidates').insert([
        { name, description, image_url: imageUrl, vote_count: 0 }
      ]);

      if (error) throw error;

      toast.success('Kandidat berhasil ditambahkan!', { id: loadingToast });
      setName('');
      setDescription('');
      setFile(null);
      setImageUrlInput('');
      setPreviewUrl('');
      fetchCandidates();
    } catch (error: unknown) {
      toast.error(`Gagal: ${error instanceof Error ? error.message : 'Terjadi kesalahan.'}`, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  // Hapus Kandidat
  const handleDelete = async (id: string) => {
    const confirmDelete = globalThis.confirm('Yakin ingin menghapus kandidat ini? Semua jumlah vote-nya juga akan hilang.');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('candidates').delete().eq('id', id);
      if (error) throw error;
      toast.success('Kandidat berhasil dihapus.');
      setCandidates((prev) => prev.filter((c) => c.id !== id));
    } catch (error: unknown) {
      toast.error(`Gagal menghapus: ${error instanceof Error ? error.message : 'Terjadi kesalahan.'}`);
    }
  };

  return (
    <div className="app-gradient min-h-screen px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <Toaster />
      <div className="mx-auto max-w-5xl">
        {/* Navigasi Balik */}
        <button 
          onClick={() => router.push('/admin/dashboard')}
          className="mb-3 inline-block text-sm font-medium text-teal-700 hover:underline sm:mb-4"
        >
          ← Kembali ke Dashboard Monitoring
        </button>

        <h1 className="mb-2 text-2xl font-bold text-slate-800 sm:text-3xl">Kelola Kandidat</h1>
        <p className="mb-6 text-sm text-slate-500 sm:mb-8">Atur profil kandidat dan unggah foto dengan kontrol ukuran agar tampilan selalu rapi.</p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-8">
          {/* Form Tambah Kandidat */}
          <div className="h-fit rounded-2xl border border-teal-100 bg-white p-4 shadow-sm sm:p-6 md:col-span-1">
            <h2 className="mb-4 text-lg font-bold text-slate-700">Tambah Kandidat</h2>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div>
                <label htmlFor="candidateName" className="mb-1 block text-xs font-semibold uppercase text-slate-500">Nama</label>
                <input 
                id="candidateName"
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40"
                  placeholder="Nama Peserta/Tim"
                />
              </div>
              <div>
                <label htmlFor="candidateDescription" className="mb-1 block text-xs font-semibold uppercase text-slate-500">Deskripsi / Bio</label>
                <textarea 
                  id="candidateDescription"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40"
                  placeholder="Deskripsi singkat..."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Sumber Gambar</label>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`rounded-md px-3 py-2 text-xs font-semibold transition ${uploadMode === 'file' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`rounded-md px-3 py-2 text-xs font-semibold transition ${uploadMode === 'url' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    Gunakan URL
                  </button>
                </div>
              </div>

              <div>
                {uploadMode === 'file' ? (
                  <>
                    <label htmlFor="candidateImage" className="mb-1 block text-xs font-semibold uppercase text-slate-500">Foto Kandidat</label>
                    <input 
                      id="candidateImage"
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0] || null;
                        setFile(selectedFile);
                        setImageUrlInput('');
                        setPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : '');
                      }}
                      className="w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      Maks {siteContent.candidateImageMaxMb}MB, resolusi maks {siteContent.candidateImageMaxWidth}x{siteContent.candidateImageMaxHeight}px.
                    </p>
                  </>
                ) : (
                  <>
                    <label htmlFor="candidateImageUrl" className="mb-1 block text-xs font-semibold uppercase text-slate-500">URL Gambar</label>
                    <input
                      id="candidateImageUrl"
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => {
                        setImageUrlInput(e.target.value);
                        setFile(null);
                        setPreviewUrl(e.target.value);
                      }}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40"
                      placeholder="https://example.com/kandidat.jpg"
                    />
                  </>
                )}

                {previewUrl && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <img src={previewUrl} alt="Preview kandidat" className="h-36 w-full object-cover" />
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </form>
          </div>

          {/* Daftar Kandidat Saat Ini */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-700">Daftar Kandidat ({candidates.length})</h2>
            {candidates.map((candidate) => (
              <div key={candidate.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center">
                    {candidate.image_url ? (
                      <img src={candidate.image_url} alt={candidate.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-400 text-xs">No img</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{candidate.name}</h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{candidate.description}</p>
                    <span className="mt-1 inline-block rounded bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                      {candidate.vote_count} Votes
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(candidate.id)}
                  className="w-full rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 sm:w-auto"
                >
                  Hapus
                </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}