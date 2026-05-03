import { createClient } from '../../lib/supabase-server';

export const runtime = 'nodejs';

export async function GET(req, { params }) {
  const { code } = params;
  const supabase = createClient();

  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('code', code)
    .single();

  if (error || !data) {
    return new Response('Not found', { status: 404 });
  }

  // 🔥 incrementa clique
  await supabase
    .from('links')
    .update({ clicks: (data.clicks || 0) + 1 })
    .eq('code', code);

  return Response.redirect(data.url, 302);
}
