import { NextResponse } from 'next/server'
import { getPosts } from '@/services/post.service'
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
    const { challenge_id } = body

    if (!challenge_id) {
      return NextResponse.json(
        { success: false, message: 'No challenge_id found' },
        { status: 400 }
      )
    }

    const posts = await getPosts({
      challengeId: challenge_id,
      token: authResult.token,
    })

    return NextResponse.json(
      { success: true, message: 'Posts fetched', posts },
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
