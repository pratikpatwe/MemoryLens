import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  try {
    // Get the private key from environment variables
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
    
    if (!privateKey) {
      return NextResponse.json(
        { error: 'ImageKit private key is not configured' },
        { status: 500 }
      )
    }

    // Create token that expires in 30 minutes
    const token = crypto.randomBytes(16).toString('hex')
    const expire = Math.floor(Date.now() / 1000) + 30 * 60 // 30 minutes
    
    // Create signature
    const signatureData = token + expire
    const hmac = crypto.createHmac('sha1', privateKey)
    const signature = hmac.update(signatureData).digest('hex')
    
    return NextResponse.json({
      signature,
      token,
      expire
    })
  } catch (error) {
    console.error('Error generating ImageKit auth parameters:', error)
    return NextResponse.json(
      { error: 'Failed to generate authentication parameters' },
      { status: 500 }
    )
  }
}