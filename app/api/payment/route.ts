import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { createClient } from '@supabase/supabase-js';
import { siteContent } from '@/utils/site-content';

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

const parseVotePrice = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getConfiguredVotePrice = async () => {
  const fallback = siteContent.votePrice;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return fallback;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'vote_price')
    .maybeSingle();

  return parseVotePrice(data?.value, fallback);
};

export async function POST(request: Request) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json(
        { error: 'MIDTRANS_SERVER_KEY belum diatur di environment.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, candidateId, candidateName } = body as {
      name?: string;
      candidateId?: string;
      candidateName?: string;
    };

    if (!name || !candidateId || !candidateName) {
      return NextResponse.json(
        { error: 'Data pembayaran tidak lengkap.' },
        { status: 400 }
      );
    }

    // Inisialisasi Midtrans Snap
    const snap = new midtransClient.Snap({
      isProduction,
      serverKey,
    });

    const votePrice = await getConfiguredVotePrice();

    // Buat Order ID unik
    const shortCandidateId = candidateId.substring(0, 8);
    const orderId = `VOTE-${shortCandidateId}-${Date.now()}`;

    // Parameter transaksi
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: votePrice,
      },
      customer_details: {
        first_name: name,
      },
      item_details: [{
        id: candidateId,
        price: votePrice,
        quantity: 1,
        name: `Vote untuk ${candidateName}`
      }],
      // Paksa tampilkan kanal digital umum untuk voting
      enabled_payments: ['qris', 'bca_va']
    };

    const transaction = await snap.createTransaction(parameter);
    
    return NextResponse.json({ 
      token: transaction.token,
      orderId: orderId
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}