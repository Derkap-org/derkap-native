import { encrypt, decrypt } from '@/services/encryption.service'
import { UUID } from 'crypto'
import { supabase } from '@/services/supabase.service'

export const uploadPost = async ({
  base64img,
  challengeId,
  profileID,
}: {
  base64img: string
  challengeId: number
  profileID: UUID
}) => {
  console.log(
    `Uploading post for profile ${profileID} and challenge ${challengeId}: ${base64img.substring(0, 5)}...`
  )
  const buffer = Buffer.from(base64img, 'base64')
  const { encryptedData, iv } = encrypt({ buffer })

  const { error: errorPhoto } = await supabase.from('encrypted_post').upsert(
    [
      {
        profile_id: profileID,
        challenge_id: challengeId,
        encrypted_data: encryptedData,
        iv,
      },
    ],
    {
      onConflict: 'profile_id, challenge_id',
    }
  )

  if (errorPhoto) {
    console.error('Error uploading photo:', errorPhoto)
    throw errorPhoto
  }
}

export const getPosts = async ({ challengeId }: { challengeId: number }) => {
  const { data, error } = await supabase
    .from('encrypted_post')
    .select(`*, creator:profile(*)`)
    .eq('challenge_id', challengeId)

  if (error) {
    console.error('Error fetching posts:', error)
    throw error
  }

  if (!data) {
    return []
  }

  const posts = data.map((post) => {
    const { encrypted_data, iv, ...rest } = post
    const decryptedBuffer = decrypt(encrypted_data, iv)
    const base64Data = decryptedBuffer.toString('base64')
    const img = `data:image/jpeg;base64,${base64Data}`

    return {
      ...rest,
      base64img: img,
    }
  })
  return posts
}
