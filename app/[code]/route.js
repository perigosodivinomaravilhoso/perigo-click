import { supabase } from '../../lib/supabase';
import { redirect } from 'next/navigation';

export async function GET(req, { params }) {
  const { data } = await supabase
    .from('links')
    .select('*')
    .eq('code', params.code)
    .single();

  if (data?.url) {
    // incrementa clique
    await supabase
      .from('links')
      .update({ clicks: data.clicks + 1 })
      .eq('code', params.code);

    redirect(data.url);
  } else {
    return new Response('Link não encontrado', { status: 404 });
  }
}
