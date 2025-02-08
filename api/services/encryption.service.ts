import crypto from 'crypto'
import { getSupabaseClient } from './supabase.service';
const SERVER_PRIVATE_KEY = "seerver-key" //process.env.SERVER_PRIVATE_KEY!

export const generateEncryptionKey = (baseKey: string): string => {
  const hmac = crypto.createHmac('sha256', SERVER_PRIVATE_KEY);
  hmac.update(baseKey);
  const digest =  hmac.digest();
  return digest.toString('hex');
}

export const getEncryptionKey = async ({challengeId, groupId, access_token, refresh_token}:{challengeId:string, groupId:string; access_token:string, refresh_token:string}) => {
  const supabase = await getSupabaseClient({access_token, refresh_token})
  const user_id = (await supabase.auth.getSession()).data.session?.user.id
  if (!user_id) {
    throw new Error('User not found')
  }
  // check if challenge is valid for the group
  const { data: challenges, error } = await supabase
    .from('challenge')
    .select('id, base_key')
    .eq('id', challengeId)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    throw new Error(error.message)
  }

  if (!challenges || challenges.length === 0) {
    throw new Error('Challenge not found')
  }

  // check if the user is in the group
  const { data: groupProfiles, error: groupProfilesError } = await supabase
    .from('group_profile')
    .select('id')
    .eq('group_id', groupId)
    .eq('profile_id', user_id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (groupProfilesError) {
    throw new Error(groupProfilesError.message)
  }

  if (!groupProfiles || groupProfiles.length === 0) {
    throw new Error('User not in the group')
  }

  const challenge = challenges[0]
  const challenge_base_key = challenge.base_key
  if (!challenge_base_key) {
    throw new Error('Challenge base key not found')
  }

  const encryptionKey = generateEncryptionKey(challenge_base_key)
  return encryptionKey

}