import { supabase } from '../../lib/supabase';
import { redirect } from 'next/navigation';

export async function GET(req, { params }) {
  const { data } = await supabase
    .from('links')
    .select('url')
    .eq('code', params.code)
    .single();

  if (data?.url) {
    redirect(data.url);
  } else {
    return new Response('Link não encontrado', { status: 404 });
  }
}
