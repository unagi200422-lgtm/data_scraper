import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const platform = searchParams.get('platform')
  const sessionId = searchParams.get('sessionId')
  
  if (!platform || !sessionId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }
  
  // Mark session as connected
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/connect/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, platform, cookies: 'connected' })
  })
  
  // Return success page
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
            max-width: 400px;
          }
          .success {
            color: #22c55e;
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .button {
            background: #22c55e;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 1rem;
          }
          .button:hover {
            background: #16a34a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✓</div>
          <h2>Connected Successfully!</h2>
          <p>Your ${platform} account has been connected.</p>
          <p>You can now close this window and return to the app.</p>
          <button class="button" onclick="closeWindow()">Close Window</button>
        </div>
        <script>
          function closeWindow() {
            // Notify parent window
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'connect_success', 
                platform: '${platform}',
                sessionId: '${sessionId}'
              }, '*');
            }
            window.close();
          }
          
          // Auto-close after 3 seconds
          setTimeout(closeWindow, 3000);
        </script>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  })
} 