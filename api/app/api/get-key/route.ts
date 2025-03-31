import { NextResponse } from 'next/server'

import { verifyToken } from '@/services/auth.service'
import { getEncryptionKey } from '@/services/encryption.service'
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
    const { derkap_id } = body

    if (!derkap_id) {
      return NextResponse.json(
        { success: false, message: 'No derkap_id found' },
        { status: 400 }
      )
    }

    const encryption_key = await getEncryptionKey({
      derkapId: derkap_id,
      access_token: authResult.access_token,
      refresh_token: authResult.refresh_token,
    })

    return NextResponse.json(
      { success: true, key: encryption_key },
      { status: 200 }
    )
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
