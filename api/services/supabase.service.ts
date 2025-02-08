import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export const getSupabaseClient = async ({access_token, refresh_token}:{access_token:string, refresh_token:string}) => {
  const supabase =  createClient(supabaseUrl, supabaseAnonKey)
  supabase.auth.setSession({access_token, refresh_token})
  return supabase 
}