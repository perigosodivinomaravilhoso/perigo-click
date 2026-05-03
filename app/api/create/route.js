import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { code, url } = await req.json();

  const { error } = await supabase
    .from('links')
    .insert([{ code, url }]);

  if (error) {
    console.log(error);
  return new Response(error.message, { status: 500 });
  }

  return Response.json({ success: true });
}
