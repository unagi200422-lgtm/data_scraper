"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/lib/icons"

export function LinkedInBookmarklet() {
  const bookmarkletCode = `javascript:(function(){try{function t(s){return document.querySelector(s)?.innerText?.trim()||null}const data={url:location.href,name:t('.pv-text-details__left-panel .text-heading-xlarge')||t('.top-card__name')||t('h1'),headline:t('.pv-text-details__left-panel .text-body-medium')||t('.top-card-layout__headline')||t('.top-card__headline')||t('h2'),location:t('.pv-text-details__left-panel .text-body-small')||t('.top-card-layout__first-subline')||t('.profile-info-subheader span')||t('h3'),scrapedAt:new Date().toISOString()};if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(JSON.stringify(data,null,2)).then(()=>alert('Scraped JSON copied to clipboard!')).catch(()=>alert(JSON.stringify(data,null,2)))}else{alert(JSON.stringify(data,null,2))}}catch(e){alert('Scrape failed: '+e.message)}})();`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookmarkletCode)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.Linkedin className="h-5 w-5 text-blue-600" />
          LinkedIn Bookmarklet Scraper
        </CardTitle>
        <CardDescription>
          Quick browser-based LinkedIn profile scraper that works with your logged-in session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h3 className="font-semibold">Step 1: Install Bookmarklet</h3>
          <p className="text-sm text-muted-foreground">
            Drag the link below to your bookmarks bar:
          </p>
          <a
            href={bookmarkletCode}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Scrape LinkedIn Profile
          </a>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Step 2: Use Bookmarklet</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Log in to LinkedIn in your browser</li>
            <li>Open the LinkedIn profile you want to scrape</li>
            <li>Click your bookmarklet in the bookmarks bar</li>
            <li>A popup will show the scraped JSON (Name, Headline, Location, URL, timestamp)</li>
            <li>JSON is automatically copied to clipboard if allowed</li>
          </ol>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Example Output</h3>
          <pre className="bg-muted/50 p-3 rounded text-xs overflow-x-auto">
{`{
  "url": "https://www.linkedin.com/in/exampleprofile",
  "name": "John Doe", 
  "headline": "Software Engineer | AI Enthusiast",
  "location": "San Francisco, California, United States",
  "scrapedAt": "2025-01-25T08:00:00.000Z"
}`}
          </pre>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Manual Installation</h3>
          <p className="text-sm text-muted-foreground">
            If drag-and-drop doesn't work, create a new bookmark and paste this code:
          </p>
          <div className="relative">
            <pre className="bg-muted/50 p-3 rounded text-xs overflow-x-auto">
              <code>{bookmarkletCode}</code>
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={copyToClipboard}
            >
              <Icons.Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <Icons.AlertTriangle className="h-4 w-4 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This runs entirely in your browser using your logged-in LinkedIn session. 
            Use ethically and responsibly.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
