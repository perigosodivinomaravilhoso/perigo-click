import { createClient } from '../../../lib/supabase-server';

export async function POST(req) {
  const supabase = createClient();

  // 🔐 verifica usuário logado
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 📦 dados do request
  const { code, url } = await req.json();

  // 🧠 validação básica
  if (!code || !url) {
    return new Response('Missing code or url', { status: 400 });
  }

  // 💾 inserir no banco
  const { error } = await supabase
    .from('links')
    .insert([{ code, url }]);

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return Response.json({ success: true });
}
