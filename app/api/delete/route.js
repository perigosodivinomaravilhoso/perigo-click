import { createClient } from '../../../lib/supabase-server';

export async function POST(req) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { code } = await req.json();

  const { error } = await supabase
    .from('links')
    .delete()
    .eq('code', code)
    .eq('user_id', user.id)

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return Response.json({ success: true });
}
