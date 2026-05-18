const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const siteContent = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'E-Voting Polban Garuda Stride',
  heroBadge: process.env.NEXT_PUBLIC_HERO_BADGE || 'Pemilihan Terverifikasi',
  heroTitle: process.env.NEXT_PUBLIC_HERO_TITLE || 'Suaramu Bernilai, Dukung Kandidat Favorit Hari Ini.',
  heroSubtitle:
    process.env.NEXT_PUBLIC_HERO_SUBTITLE ||
    'Semua transaksi vote diproses aman melalui pembayaran digital. Satu transaksi mewakili satu dukungan yang valid.',
  voteButtonLabel: process.env.NEXT_PUBLIC_VOTE_BUTTON_LABEL || 'Vote Sekarang',
  candidateSectionTitle: process.env.NEXT_PUBLIC_CANDIDATE_SECTION_TITLE || 'Kandidat Tersedia',
  voteUnitLabel: process.env.NEXT_PUBLIC_VOTE_UNIT_LABEL || 'Votes',
  votePrice: toNumber(process.env.NEXT_PUBLIC_VOTE_PRICE, 10000),
  voteFormTitle: process.env.NEXT_PUBLIC_VOTE_FORM_TITLE || 'Konfirmasi Dukungan Kandidat',
  voteFormDescription:
    process.env.NEXT_PUBLIC_VOTE_FORM_DESCRIPTION ||
    'Masukkan nama Anda lalu lanjutkan pembayaran QRIS untuk mengunci pilihan.',
  voteInputLabel: process.env.NEXT_PUBLIC_VOTE_INPUT_LABEL || 'Nama Lengkap Anda',
  voteInputPlaceholder: process.env.NEXT_PUBLIC_VOTE_INPUT_PLACEHOLDER || 'Contoh: Nunu Dwijaya',
  paymentButtonPrefix: process.env.NEXT_PUBLIC_PAYMENT_BUTTON_PREFIX || 'Bayar via QRIS',
  testPayButtonLabel: process.env.NEXT_PUBLIC_TEST_PAY_BUTTON_LABEL || 'Test Pay Auto Approve',
  testPayHelperText:
    process.env.NEXT_PUBLIC_TEST_PAY_HELPER_TEXT ||
    'Mode test sandbox: sekali klik langsung tersimpan sebagai vote approved.',
  enableMidtransTestApproval: process.env.NEXT_PUBLIC_ENABLE_MIDTRANS_TEST_APPROVAL === 'true',
  adminDashboardTitle: process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_TITLE || 'Admin Monitoring',
  adminDashboardSubtitle:
    process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_SUBTITLE ||
    'Rekapitulasi transaksi dan pengaturan E-Voting Polban Garuda Stride',
  candidateImageMaxMb: toNumber(process.env.NEXT_PUBLIC_CANDIDATE_IMAGE_MAX_MB, 3),
  candidateImageMaxWidth: toNumber(process.env.NEXT_PUBLIC_CANDIDATE_IMAGE_MAX_WIDTH, 1600),
  candidateImageMaxHeight: toNumber(process.env.NEXT_PUBLIC_CANDIDATE_IMAGE_MAX_HEIGHT, 1600),
};

export const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
