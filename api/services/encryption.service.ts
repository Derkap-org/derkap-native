import crypto from 'crypto'
import { getSupabaseClient } from './supabase.service';
const SERVER_PRIVATE_KEY = "seerver-key" //process.env.SERVER_PRIVATE_KEY!

export const generateDerkapBaseKey = async ({
  user_id,
  challenge,
}: {
  user_id: string;
  challenge: string;
}) => {
  const timestamp = Date.now();
  const challenge_key = crypto
    .createHash("sha256")
    .update(`${user_id}_${challenge}_${timestamp}`)
    .digest("hex");
  return challenge_key;
};

export const generateEncryptionKey = (baseKey: string): string => {
  const hmac = crypto.createHmac('sha256', SERVER_PRIVATE_KEY);
  hmac.update(baseKey);
  const digest =  hmac.digest();
  return digest.toString('hex');
}

/*
create table
  public.derkap_allowed_users (
    derkap_id bigint not null,
    allowed_user_id uuid not null,
    created_at timestamp with time zone not null default now(),
    constraint derkap_permissions_pkey primary key (derkap_id, allowed_user_id),
    constraint fk_user foreign key (allowed_user_id) references profile (id) on delete cascade,
    constraint derkap_allowed_users_derkap_id_fkey foreign key (derkap_id) references derkap (id) on delete cascade
  ) tablespace pg_default;
*/

export const getEncryptionKey = async ({ derkapId, access_token, refresh_token }: { derkapId: string; access_token: string; refresh_token: string }) => {
  const supabase = await getSupabaseClient({ access_token, refresh_token });
  const user_id = (await supabase.auth.getSession()).data.session?.user.id;
  if (!user_id) {
    throw new Error('User not found')
  }

 // check if user is allowed to access derkap using the derkap_allowed_users table
 const { data: derkapAllowedUsers, error: derkapAllowedUsersError } = await supabase
   .from('derkap_allowed_users')
   .select('*')
   .eq('derkap_id', derkapId)
   .eq('allowed_user_id', user_id)
   .limit(1)

  if (derkapAllowedUsersError) {
    throw new Error(derkapAllowedUsersError.message)
  }

  if (!derkapAllowedUsers || derkapAllowedUsers.length === 0) {
    throw new Error('User not allowed to access derkap')
  }


  // get derkap base key
  const { data: derkap, error } = await supabase
    .from('derkap')
    .select('id, base_key')
    .eq('id', derkapId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    throw new Error(error.message)
  }

  if (!derkap || derkap.length === 0) {
    throw new Error('Challenge not found')
  }

  const derkap_base_key = derkap[0].base_key
  if (!derkap_base_key) {
    throw new Error('Challenge base key not found')
  }

  const encryptionKey = generateEncryptionKey(derkap_base_key)
  return encryptionKey
}



