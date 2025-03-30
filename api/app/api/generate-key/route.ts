import { NextResponse } from 'next/server'

import { verifyToken } from '@/services/auth.service'
import { generateEncryptionKey, generateDerkapBaseKey } from '@/services/encryption.service'
import { getSupabaseClient } from '@/services/supabase.service'
export async function POST(req: Request) {
  try {
    const authResult = await verifyToken(req)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.error }, { status: 401 })
    }

    if (!authResult.access_token || !authResult.refresh_token || !authResult.user) {
      return NextResponse.json({ success: false, message: 'Auth failed' }, { status: 400 })
    }

    const body = await req.json()
    const { challenge } = body
    

    const supabase = await getSupabaseClient({ access_token: authResult.access_token, refresh_token: authResult.refresh_token });
    const user_id = (await supabase.auth.getSession()).data.session?.user.id;
    if (!user_id) {
      throw new Error('User not found')
    }
    
    const derkap_base_key = await generateDerkapBaseKey({
      user_id: user_id,
      challenge,
    });

    const encryption_key = generateEncryptionKey(derkap_base_key);

    return NextResponse.json(
      { success: true, key: encryption_key, base_key: derkap_base_key },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error :', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    )
  }
}
