import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory store (in production, use a database)
const sessions = new Map<string, { platform: string; cookies: string; connected: boolean }>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  const platform = searchParams.get('platform')
  
  if (!sessionId || !platform) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }
  
  // Mark the session as connected
  sessions.set(sessionId, {
    platform,
    cookies: 'mock-cookies', // In real implementation, extract actual cookies
    connected: true
  })
  
  // Return a simple HTML page that closes the window
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Connection Successful</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0;
            background: #f5f5f5;
          }
          .container {
            text-align: center;
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .success {
            color: #22c55e;
            font-size: 3rem;
            margin-bottom: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✓</div>
          <h2>Connected Successfully!</h2>
          <p>Your ${platform} account has been connected.</p>
          <p>You can now close this window and return to the app.</p>
        </div>
        <script>
          // Notify parent window and close
          if (window.opener) {
            window.opener.postMessage({ type: 'connect_success', platform: '${platform}' }, '*');
          }
          setTimeout(() => {
            window.close();
          }, 2000);
        </script>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  })
}

export async function POST(request: NextRequest) {
  const { sessionId, platform, cookies } = await request.json()
  
  if (!sessionId || !platform) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }
  
  sessions.set(sessionId, {
    platform,
    cookies: cookies || 'mock-cookies',
    connected: true
  })
  
  return NextResponse.json({ success: true })
}