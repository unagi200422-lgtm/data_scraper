import { type NextRequest, NextResponse } from "next/server"
import { LinkedInScraper } from "@/lib/linkedin-scraper"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    if (!url.includes("linkedin.com")) {
      return NextResponse.json({ error: "Invalid LinkedIn URL" }, { status: 400 })
    }

    console.log("[v0] Processing LinkedIn URL:", url)

    const data = await LinkedInScraper.scrapeProfile(url)

    console.log("[v0] Successfully scraped LinkedIn data")

    return NextResponse.json({
      success: true,
      data,
      platform: "linkedin",
      url,
    })
  } catch (error) {
    console.error("[v0] LinkedIn scraping error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to scrape LinkedIn profile",
        details:
          "The scraper attempted multiple strategies but was unable to extract data. This may be due to LinkedIn's anti-bot measures.",
      },
      { status: 500 },
    )
  }
}
