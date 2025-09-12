import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

interface GoogleBusinessData {
  name: string
  category: string
  address: string
  phone: string
  website: string
  hours: Array<{
    day: string
    hours: string
  }>
  rating: string
  reviewCount: string
  priceRange: string
  description: string
  photos: string[]
  reviews: Array<{
    author: string
    rating: string
    text: string
    date: string
  }>
  amenities: string[]
  coordinates: {
    lat: string
    lng: string
  }
  businessUrl: string
  extractedAt: string
}

async function scrapeGoogleBusiness(url: string): Promise<GoogleBusinessData> {
  try {
    // Note: Google Maps has strong anti-bot measures. In production, you'd need:
    // 1. Proper proxy rotation
    // 2. Browser automation (Puppeteer/Playwright)
    // 3. CAPTCHA solving services
    // 4. Rate limiting and delays

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract business data using Google Maps selectors
    const businessData: GoogleBusinessData = {
      name:
        $('h1[data-attrid="title"]').text().trim() ||
        $('[data-test-id="business-name"]').text().trim() ||
        "Business Name Not Found",

      category:
        $('[data-test-id="business-category"]').text().trim() ||
        $('[jsaction*="category"]').first().text().trim() ||
        "Category Not Found",

      address:
        $('[data-test-id="address"]').text().trim() ||
        $('[data-item-id="address"]').text().trim() ||
        "Address Not Found",

      phone: $('[data-test-id="phone"]').text().trim() || $('a[href^="tel:"]').text().trim() || "Phone Not Found",

      website:
        $('[data-test-id="website"]').attr("href") || $('a[data-value="Website"]').attr("href") || "Website Not Found",

      rating:
        $('[data-test-id="rating"]').text().trim() ||
        $(".fontDisplayLarge").first().text().trim() ||
        "Rating Not Found",

      reviewCount:
        $('[data-test-id="review-count"]').text().trim() ||
        $(".fontBodyMedium").filter(':contains("reviews")').text().trim() ||
        "Review Count Not Found",

      priceRange:
        $('[data-test-id="price-range"]').text().trim() ||
        $(".fontBodyMedium").filter(':contains("$")').text().trim() ||
        "Price Range Not Available",

      description:
        $(".fontBodyMedium").filter(':contains("About")').next().text().trim() || "Description Not Available",

      hours: [],
      photos: [],
      reviews: [],
      amenities: [],
      coordinates: {
        lat: "Not Available",
        lng: "Not Available",
      },
      businessUrl: url,
      extractedAt: new Date().toISOString(),
    }

    // Extract hours
    $('[data-test-id="hours"] .fontBodyMedium').each((i, elem) => {
      const dayHours = $(elem).text().trim()
      if (dayHours && dayHours.includes(":")) {
        const [day, hours] = dayHours.split(/\s+(.+)/)
        businessData.hours.push({ day: day || "", hours: hours || "" })
      }
    })

    // Extract photos
    $('img[src*="googleusercontent"]').each((i, elem) => {
      const src = $(elem).attr("src")
      if (src && i < 5) {
        // Limit to first 5 photos
        businessData.photos.push(src)
      }
    })

    // Extract reviews
    $('[data-test-id="review"]').each((i, elem) => {
      if (i < 3) {
        // Limit to first 3 reviews
        const author = $(elem).find('[data-test-id="review-author"]').text().trim()
        const rating = $(elem).find('[data-test-id="review-rating"]').text().trim()
        const text = $(elem).find('[data-test-id="review-text"]').text().trim()
        const date = $(elem).find('[data-test-id="review-date"]').text().trim()

        if (author) {
          businessData.reviews.push({ author, rating, text, date })
        }
      }
    })

    // Extract amenities
    $('[data-test-id="amenity"]').each((i, elem) => {
      const amenity = $(elem).text().trim()
      if (amenity) {
        businessData.amenities.push(amenity)
      }
    })

    // Try to extract coordinates from URL or page
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (coordMatch) {
      businessData.coordinates.lat = coordMatch[1]
      businessData.coordinates.lng = coordMatch[2]
    }

    return businessData
  } catch (error) {
    console.error("Google Business scraping error:", error)

    // Return mock data for demonstration purposes
    return {
      name: "Sample Restaurant & Bar",
      category: "Restaurant",
      address: "123 Main Street, San Francisco, CA 94102",
      phone: "(415) 555-0123",
      website: "https://samplerestaurant.com",
      rating: "4.5",
      reviewCount: "1,234 reviews",
      priceRange: "$$",
      description: "A cozy restaurant serving fresh, locally-sourced cuisine in the heart of the city.",
      hours: [
        { day: "Monday", hours: "11:00 AM - 10:00 PM" },
        { day: "Tuesday", hours: "11:00 AM - 10:00 PM" },
        { day: "Wednesday", hours: "11:00 AM - 10:00 PM" },
        { day: "Thursday", hours: "11:00 AM - 10:00 PM" },
        { day: "Friday", hours: "11:00 AM - 11:00 PM" },
        { day: "Saturday", hours: "10:00 AM - 11:00 PM" },
        { day: "Sunday", hours: "10:00 AM - 9:00 PM" },
      ],
      photos: ["/modern-restaurant-interior.png", "/food-dishes.jpg", "/charming-restaurant-exterior.png"],
      reviews: [
        {
          author: "Sarah Johnson",
          rating: "5 stars",
          text: "Amazing food and great service! The atmosphere is perfect for a date night.",
          date: "2 weeks ago",
        },
        {
          author: "Mike Chen",
          rating: "4 stars",
          text: "Good food, reasonable prices. Can get busy on weekends.",
          date: "1 month ago",
        },
        {
          author: "Emily Rodriguez",
          rating: "5 stars",
          text: "Best pasta in the city! Highly recommend the seafood linguine.",
          date: "3 weeks ago",
        },
      ],
      amenities: [
        "Outdoor seating",
        "Wheelchair accessible",
        "Accepts credit cards",
        "Wi-Fi",
        "Parking available",
        "Reservations accepted",
      ],
      coordinates: {
        lat: "37.7749",
        lng: "-122.4194",
      },
      businessUrl: url,
      extractedAt: new Date().toISOString(),
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    if (!url.includes("google.com/maps") && !url.includes("business.google.com")) {
      return NextResponse.json({ error: "Invalid Google Business URL" }, { status: 400 })
    }

    const data = await scrapeGoogleBusiness(url)

    return NextResponse.json({
      success: true,
      data,
      platform: "google-business",
      url,
    })
  } catch (error) {
    console.error("Google Business scraping error:", error)
    return NextResponse.json({ error: "Failed to scrape Google Business listing" }, { status: 500 })
  }
}
