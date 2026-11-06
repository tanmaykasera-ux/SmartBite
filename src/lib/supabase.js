import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload a food dish image to Supabase Storage bucket `food-images`
 * Falls back to a base64 Data URL when in Demo Mode so image uploads work immediately.
 */
export async function uploadFoodImage(file) {
  if (!file) return '';

  if (isSupabaseConfigured && supabase) {
    const ext = file.name.split('.').pop();
    const fileName = `dishes/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from('food-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('food-images')
      .getPublicUrl(fileName);

    return publicUrlData?.publicUrl || '';
  }

  // Demo Mode: convert File to persistent Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Submit a B2B Demo Request (persists to Supabase `demo_requests` if configured, with Demo Mode fallback)
 */
export async function submitDemoRequest(payload) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('demo_requests')
      .insert([payload])
      .select();
    if (error) throw error;
    return data;
  }

  const existing = JSON.parse(localStorage.getItem('smartbite_demo_requests') || '[]');
  const record = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    ...payload,
    status: 'new',
    created_at: new Date().toISOString(),
  };
  localStorage.setItem('smartbite_demo_requests', JSON.stringify([record, ...existing]));
  return [record];
}

/**
 * Submit a Contact Message (persists to Supabase `contact_messages` if configured, with Demo Mode fallback)
 */
export async function submitContactMessage(payload) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([payload])
      .select();
    if (error) throw error;
    return data;
  }

  const existing = JSON.parse(localStorage.getItem('smartbite_contact_messages') || '[]');
  const record = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    ...payload,
    status: 'unread',
    created_at: new Date().toISOString(),
  };
  localStorage.setItem('smartbite_contact_messages', JSON.stringify([record, ...existing]));
  return [record];
}
