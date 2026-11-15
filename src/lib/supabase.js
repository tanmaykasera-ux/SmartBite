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
 * Helper to generate a client-side UUID v4 without requiring SELECT/RETURNING from Supabase
 */
function generateClientUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Submit a B2B Demo Request (persists to Supabase `demo_requests` if configured, with Demo Mode fallback).
 * Uses insert-only (no .select() or .single()) and sends only public anon-allowed columns
 * so anonymous visitors never trigger SELECT RLS policies.
 */
export async function submitDemoRequest(payload = {}) {
  const clientId = generateClientUuid();
  const cleanRow = {
    id: clientId,
    full_name: String(payload.full_name || '').trim(),
    work_email: String(payload.work_email || '').trim(),
    phone: String(payload.phone || '').trim(),
    institution_name: String(payload.institution_name || '').trim(),
    institution_type: String(payload.institution_type || 'college_mess').trim(),
    daily_meals_served: Math.max(1, Math.round(Number(payload.daily_meals_served) || 500)),
    message: payload.message ? String(payload.message).trim() : null,
  };

  if (payload.mess_name && String(payload.mess_name).trim()) {
    cleanRow.mess_name = String(payload.mess_name).trim();
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('demo_requests')
      .insert(cleanRow);

    if (error) {
      throw new Error(
        error.message || 'Unable to submit your demo request right now. Please try again.'
      );
    }
    return { ...cleanRow };
  }

  const existing = JSON.parse(localStorage.getItem('smartbite_demo_requests') || '[]');
  const record = {
    ...cleanRow,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem('smartbite_demo_requests', JSON.stringify([record, ...existing]));
  return record;
}

/**
 * Submit a Contact Message (persists to Supabase `contact_messages` if configured, with Demo Mode fallback).
 * Uses insert-only (no .select() or .single()) and sends only public anon-allowed columns
 * so anonymous visitors never trigger SELECT RLS policies.
 */
export async function submitContactMessage(payload = {}) {
  const clientId = generateClientUuid();
  const cleanRow = {
    id: clientId,
    full_name: String(payload.full_name || '').trim(),
    email: String(payload.email || '').trim(),
    institution_name: payload.institution_name
      ? String(payload.institution_name).trim()
      : null,
    topic: String(payload.topic || 'General Inquiry').trim(),
    message: String(payload.message || '').trim(),
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('contact_messages')
      .insert(cleanRow);

    if (error) {
      throw new Error(
        error.message || 'Unable to send your message right now. Please try again.'
      );
    }
    return { ...cleanRow };
  }

  const existing = JSON.parse(localStorage.getItem('smartbite_contact_messages') || '[]');
  const record = {
    ...cleanRow,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem('smartbite_contact_messages', JSON.stringify([record, ...existing]));
  return record;
}
