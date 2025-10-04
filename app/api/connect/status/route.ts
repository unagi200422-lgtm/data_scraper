import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory store (in production, use a database)
const sessions = new Map<string, { platform: string; cookies: string; connected: boolean }>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  
  if (sessionId) {
    // Check specific session
    const session = sessions.get(sessionId)
    return NextResponse.json({
      connected: session?.connected || false,
      platform: session?.platform
    })
  }
  
  // Return general connection status
  return NextResponse.json({
    facebook: Array.from(sessions.values()).some(s => s.platform === 'facebook' && s.connected),
    linkedin: Array.from(sessions.values()).some(s => s.platform === 'linkedin' && s.connected)
  })
}