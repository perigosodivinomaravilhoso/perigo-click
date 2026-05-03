import { createClient } from '../../lib/supabase-server';

export const runtime = 'nodejs';

export async function GET(req, { params }) {
  const { code } = params;
  const supabase = createClient();

  // busca link
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('code', code)
    .single();

  if (error || !data) {
    return new Response('Not found', { status: 404 });
  }

  // incrementa clique
  await supabase
    .from('links')
    .update({ clicks: (data.clicks || 0) + 1 })
    .eq('code', code)
    .eq('user_id', data.user_id);

  // redireciona
  return Response.redirect(data.url, 302);
}
