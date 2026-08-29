import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  console.warn("Admin: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not configured.");
}

export const supabase = createClient(url || "http://localhost:54321", anonKey || "anon");

export async function uploadFile(file: File, path: string): Promise<string> {
  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}
