import { supabase } from './supabase'

export async function adminLogout() {
  await supabase.auth.signOut()
}
