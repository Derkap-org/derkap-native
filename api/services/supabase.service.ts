import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!

export const getSupabaseClient = async ({token}:{token:string}) => {
  return createClient(supabaseUrl, token)
}
