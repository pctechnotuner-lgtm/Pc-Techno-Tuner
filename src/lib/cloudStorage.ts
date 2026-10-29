
import { supabase } from './supabaseClient';

export async function loadCloudData<T>(
  key: string
): Promise<T | null> {
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError) throw authError;

  const user = authData.user;
  if (!user) throw new Error('Please log in first.');

  const { data, error } = await supabase
    .from('app_sync_data')
    .select('payload')
    .eq('user_id', user.id)
    .eq('data_key', key)
    .maybeSingle();

  if (error) throw error;

  return data ? (data.payload as T) : null;
}

export async function saveCloudData<T>(
  key: string,
  payload: T
): Promise<void> {
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError) throw authError;

  const user = authData.user;
  if (!user) throw new Error('Please log in first.');

  const { error } = await supabase
    .from('app_sync_data')
    .upsert(
      {
        user_id: user.id,
        data_key: key,
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,data_key' }
    );

  if (error) throw error;
}
