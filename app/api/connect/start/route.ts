import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { platform } = await request.json()
    
    if (!platform || !["facebook", "linkedin"].includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 })
    }
    
    // Generate a unique session ID
    const sessionId = Math.random().toString(36).substring(2, 15)
    
    // Create the connect URL that will open the login page
    const connectUrl = `/api/connect/login?platform=${platform}&sessionId=${sessionId}`
    
    return NextResponse.json({
      success: true,
      sessionId,
      connectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${connectUrl}`
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to start connection" }, { status: 500 })
  }
}
