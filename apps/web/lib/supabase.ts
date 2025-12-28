import { createClient } from '@supabase/supabase-js';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  Database,
  AuditLog,
  DashboardStats,
  ExhibitionSubmission,
  Gallery,
} from './database.types';

const getSupabaseUrlOrNull = (): string | null => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url?.trim() ? url.trim() : null;
};

const getSupabaseAnonKeyOrNull = (): string | null => {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return key?.trim() ? key.trim() : null;
};

export const isSupabaseConfigured = (): boolean => {
  return Boolean(getSupabaseUrlOrNull() && getSupabaseAnonKeyOrNull());
};

let cachedClient: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabaseClient = () => {
  if (cachedClient) return cachedClient;

  const url = getSupabaseUrlOrNull();
  const anonKey = getSupabaseAnonKeyOrNull();

  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in apps/web/.env.local.'
    );
  }

  cachedClient = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return cachedClient;
};

// Auth helpers
export const signUp = async (email: string, password: string, metadata?: { name?: string }) => {
  const supabase = getSupabaseClient();
  
  // Определяем правильный redirect URL в зависимости от текущего домена
  const redirectTo = `${window.location.origin}/gallery-dashboard`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: redirectTo, // Указываем куда вернуться после подтверждения email
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const resetPassword = async (email: string) => {
  const supabase = getSupabaseClient();
  
  // Используем текущий домен для redirect после сброса пароля
  const redirectTo = `${window.location.origin}/gallery-dashboard/reset-password`;
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  return { data, error };
};

// Gallery queries
export interface GalleryProfileInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
}

export const createGalleryForUser = async (
  userId: string,
  profile: GalleryProfileInput
): Promise<{ data: Gallery | null; error: PostgrestError | null }> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('galleries')
    .insert({
      owner_user_id: userId,
      name: profile.name,
      email: profile.email?.trim() || null,
      phone: profile.phone?.trim() || null,
      address: profile.address?.trim() || null,
      description: profile.description?.trim() || null,
      is_active: true,
    })
    .select('*')
    .returns<Gallery>()
    .single();

  return { data, error };
};

export const getGalleryByUser = async (
  userId: string
): Promise<{ data: Gallery | null; error: PostgrestError | null }> => {
  const supabase = getSupabaseClient();
  // 1) Direct owner match
  const { data: owned, error: ownedError } = await supabase
    .from('galleries')
    .select('*')
    .eq('owner_user_id', userId)
    .returns<Gallery>()
    .maybeSingle();

  if (ownedError) return { data: null, error: ownedError };
  if (owned) return { data: owned, error: null };

  // 2) Manager match
  const { data: managerRows, error: managerError } = await supabase
    .from('gallery_managers')
    .select('gallery_id')
    .eq('user_id', userId)
    .limit(1)
    .returns<Array<{ gallery_id: string }>>();

  if (managerError) return { data: null, error: managerError };
  const managerGalleryId = managerRows?.[0]?.gallery_id;
  if (!managerGalleryId) return { data: null, error: null };

  const { data: gallery, error: galleryError } = await supabase
    .from('galleries')
    .select('*')
    .eq('id', managerGalleryId)
    .returns<Gallery>()
    .maybeSingle();

  return { data: gallery ?? null, error: galleryError };
};

export const getGalleryDashboardStats = async (
  galleryId: string
): Promise<{ data: DashboardStats | null; error: PostgrestError | null }> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('gallery_dashboard_stats')
    .select('*')
    .eq('gallery_id', galleryId)
    .returns<DashboardStats>()
    .single();
  
  return { data, error };
};

export const updateGallery = async (
  galleryId: string,
  updates: Database['public']['Tables']['galleries']['Update']
): Promise<{ data: Gallery | null; error: PostgrestError | null }> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('galleries')
    .update(updates)
    .eq('id', galleryId)
    .select('*')
    .returns<Gallery>()
    .single();
  
  return { data, error };
};

// Exhibition submissions
export const getExhibitionSubmissions = async (
  galleryId: string,
  status?: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected'
): Promise<{ data: ExhibitionSubmission[] | null; error: PostgrestError | null }> => {
  const supabase = getSupabaseClient();
  let query = supabase
    .from('exhibition_submissions')
    .select('*')
    .eq('gallery_id', galleryId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.returns<ExhibitionSubmission[]>();
  return { data, error };
};

export const createExhibitionSubmission = async (
  submission: Database['public']['Tables']['exhibition_submissions']['Insert']
): Promise<{ data: ExhibitionSubmission | null; error: PostgrestError | null }> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('exhibition_submissions')
    .insert(submission)
    .select('*')
    .returns<ExhibitionSubmission>()
    .single();

  return { data, error };
};

export const updateExhibitionSubmission = async (
  id: string,
  updates: Database['public']['Tables']['exhibition_submissions']['Update']
): Promise<{ data: ExhibitionSubmission | null; error: PostgrestError | null }> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('exhibition_submissions')
    .update(updates)
    .eq('id', id)
    .select('*')
    .returns<ExhibitionSubmission>()
    .single();

  return { data, error };
};

export const deleteExhibitionSubmission = async (id: string) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('exhibition_submissions')
    .delete()
    .eq('id', id);

  return { error };
};

// Audit log
export const logGalleryAction = async (
  galleryId: string,
  action: string,
  description: string,
  metadata?: any
) => {
  const supabase = getSupabaseClient();
  const { user, error: userError } = await getCurrentUser();
  if (userError || !user) return { error: userError ?? new Error('Not authenticated') };

  const { error } = await supabase.from('gallery_audit_log').insert({
    gallery_id: galleryId,
    user_id: user.id,
    action,
    description,
    metadata,
  });

  return { error };
};

export const getAuditLog = async (
  galleryId: string,
  limit = 50
): Promise<{ data: AuditLog[] | null; error: PostgrestError | null }> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('gallery_audit_log')
    .select('*')
    .eq('gallery_id', galleryId)
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<AuditLog[]>();

  return { data, error };
};

export interface GalleryClaimRequestInput {
  galleryExternalId: string;
  galleryName?: string;
  galleryCity?: string;
  galleryCountry?: string;
  applicantEmail: string;
  applicantName?: string;
  applicantPhone?: string;
  message?: string;
}

export const submitGalleryClaimRequest = async (
  input: GalleryClaimRequestInput
): Promise<{ data: { requestId: string } | null; error: Error | null }> => {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.functions.invoke('gallery-claim-request', {
    body: {
      galleryExternalId: input.galleryExternalId,
      galleryName: input.galleryName,
      galleryCity: input.galleryCity,
      galleryCountry: input.galleryCountry,
      applicantEmail: input.applicantEmail,
      applicantName: input.applicantName,
      applicantPhone: input.applicantPhone,
      message: input.message,
    },
  });

  if (error) return { data: null, error };
  if (!data?.requestId) return { data: null, error: new Error('Claim request was submitted but no request id was returned.') };

  return { data: { requestId: String(data.requestId) }, error: null };
};
