import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const platform = searchParams.get('platform')
  const sessionId = searchParams.get('sessionId')
  
  if (!platform || !sessionId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }
  
  const doneUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/connect/done?platform=${platform}&sessionId=${sessionId}`
  
  // Create a simple HTML page that redirects to Facebook
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Connect ${platform.charAt(0).toUpperCase() + platform.slice(1)}</title>
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
            max-width: 500px;
          }
          .button {
            background: #1877f2;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin: 1rem 0.5rem;
            text-decoration: none;
            display: inline-block;
          }
          .button:hover {
            background: #166fe5;
          }
          .done-button {
            background: #22c55e;
          }
          .done-button:hover {
            background: #16a34a;
          }
          .instructions {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 1rem;
            margin: 1rem 0;
            text-align: left;
          }
          .step {
            margin: 0.5rem 0;
            padding: 0.5rem;
            background: #f8fafc;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Connect ${platform.charAt(0).toUpperCase() + platform.slice(1)}</h2>
          <div class="instructions">
            <h3>Instructions:</h3>
            <div class="step">1. Click "Go to ${platform.charAt(0).toUpperCase() + platform.slice(1)}" below</div>
            <div class="step">2. Make sure you're logged in to your ${platform} account</div>
            <div class="step">3. If not logged in, log in first</div>
            <div class="step">4. Come back to this tab and click "I'm Done"</div>
          </div>
          <a href="https://www.${platform}.com" target="_blank" class="button">Go to ${platform.charAt(0).toUpperCase() + platform.slice(1)}</a>
          <a href="${doneUrl}" class="button done-button">I'm Done</a>
        </div>
        <script>
          // Store session info
          localStorage.setItem('connect_session', JSON.stringify({ 
            platform: '${platform}', 
            sessionId: '${sessionId}' 
          }));
        </script>
      </body>
    </html>
  `
  
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  })
}