import { supabase } from '@/lib/supabase';

export async function POST(req) {
  const { code, url } = await req.json();

  const { error } = await supabase
    .from('links')
    .insert([{ code, url }]);

  if (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }

  return Response.json({ success: true });
}
