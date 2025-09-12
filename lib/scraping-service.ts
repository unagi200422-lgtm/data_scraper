export interface ScrapingResult {
  success: boolean
  data?: any
  error?: string
  platform: string
  url: string
}

export class ScrapingService {
  static async scrapeLinkedIn(url: string): Promise<ScrapingResult> {
    try {
      const response = await fetch("/api/scrape/linkedin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to scrape LinkedIn profile")
      }

      return result
    } catch (error) {
      console.error("LinkedIn scraping error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        platform: "linkedin",
        url,
      }
    }
  }

  static async scrapeGoogleBusiness(url: string): Promise<ScrapingResult> {
    try {
      const response = await fetch("/api/scrape/google-business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to scrape Google Business listing")
      }

      return result
    } catch (error) {
      console.error("Google Business scraping error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        platform: "google-business",
        url,
      }
    }
  }

  static async scrapeFacebook(url: string): Promise<ScrapingResult> {
    try {
      const response = await fetch("/api/scrape/facebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to scrape Facebook profile/page")
      }

      return result
    } catch (error) {
      console.error("Facebook scraping error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        platform: "facebook",
        url,
      }
    }
  }

  static async scrapeUrl(platform: string, url: string): Promise<ScrapingResult> {
    switch (platform) {
      case "linkedin":
        return this.scrapeLinkedIn(url)
      case "google-business":
        return this.scrapeGoogleBusiness(url)
      case "facebook":
        return this.scrapeFacebook(url)
      default:
        return {
          success: false,
          error: "Unsupported platform",
          platform,
          url,
        }
    }
  }
}
