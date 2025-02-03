import { NextResponse } from 'next/server'
import { uploadPost } from '@/services/post.service'
import { verifyToken } from '@/services/auth.service'
export async function POST(req: Request) {
  try {

    const authResult = await verifyToken(req)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.error }, { status: 401 })
    }
    
    if (!authResult.token) {
      return NextResponse.json({ success: false, message: 'No token found' }, { status: 400 })
    }

        
    const body = await req.json()
    const { base64_img, challenge_id, profile_id } = body

    if (!base64_img) {
      return NextResponse.json(
        { success: false, message: 'No photo found' },
        { status: 400 }
      )
    }

    if (!challenge_id) {
      return NextResponse.json(
        { success: false, message: 'No challenge_id found' },
        { status: 400 }
      )
    }

    if (!profile_id) {
      return NextResponse.json(
        { success: false, message: 'No profile_id found' },
        { status: 400 }
      )
    }

    await uploadPost({
      base64img: base64_img,
      challengeId: challenge_id,
      profileID: profile_id,
      token: authResult.token,
    })
    return NextResponse.json(
      { success: true, message: 'Post uploaded' },
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
