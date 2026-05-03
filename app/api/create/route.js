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

  // 💾 inserir no banco (AGORA COM user_id 🔥)
  const { error } = await supabase
    .from('links')
    .insert([
      {
        code,
        url,
        user_id: user.id // 👈 ESSA É A LINHA IMPORTANTE
      }
    ]);

  if (error) {
  // código duplicado
  if (error.code === '23505') {
    return new Response('Esse código já existe. Tente outro.', { status: 400 });
  }

  // fallback
  return new Response('Erro ao criar o link. Tente novamente.', { status: 500 });
}

  return Response.json({ success: true });
}
