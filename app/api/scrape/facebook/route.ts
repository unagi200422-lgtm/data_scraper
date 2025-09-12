import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

interface FacebookProfile {
  name: string
  username: string
  bio: string
  location: string
  website: string
  followers: string
  following: string
  posts: Array<{
    content: string
    date: string
    likes: string
    comments: string
    shares: string
  }>
  about: {
    work: string
    education: string
    relationship: string
    hometown: string
  }
  contact: {
    email: string
    phone: string
  }
  profileUrl: string
  extractedAt: string
}

interface FacebookPage {
  name: string
  category: string
  description: string
  address: string
  phone: string
  website: string
  email: string
  hours: Array<{
    day: string
    hours: string
  }>
  rating: string
  reviewCount: string
  likes: string
  followers: string
  checkins: string
  posts: Array<{
    content: string
    date: string
    likes: string
    comments: string
    shares: string
  }>
  profileUrl: string
  extractedAt: string
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 FACEBOOK SCRAPER: Starting Facebook scraping process...")
    console.log("📍 LOCATION: app/api/scrape/facebook/route.ts")
    console.log("⏰ TIMESTAMP:", new Date().toISOString())
    
    const { url } = await request.json()
    
    if (!url) {
      console.log("❌ ERROR: No URL provided")
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }
    
    console.log("🔗 SCRAPING URL:", url)

    if (!url.includes("facebook.com")) {
      return NextResponse.json({ error: "Invalid Facebook URL" }, { status: 400 })
    }

    // Try Playwright first (since it works best for Facebook)
    try {
      console.log("🎭 Trying Playwright scraping...")
      const data = await scrapeWithPlaywright(url)
      return NextResponse.json({ success: true, data })
    } catch (playwrightError) {
      console.log("⚠️ Playwright failed, trying regular scraping...")
      // Fallback to regular scraping
      const data = await scrapeFacebookProfile(url)
      return NextResponse.json({ success: true, data })
    }
    
  } catch (error) {
    console.error("❌ Facebook scraping failed:", error)
    return NextResponse.json({ 
      error: "Failed to scrape Facebook page", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

async function scrapeWithPlaywright(url: string) {
  try {
    console.log("🎭 Attempting to use Playwright for Facebook scraping...")
    
    // Check if we should use Playwright
    if (process.env.DISABLE_PLAYWRIGHT === '1' || process.env.USE_PLAYWRIGHT !== '1') {
      console.log("⚠️ Playwright disabled via environment variables")
      throw new Error("Playwright disabled")
    }

    // Use eval to avoid build-time resolution
    const playwright = await eval('import("playwright")').catch(() => null)
    if (!playwright || !playwright.chromium) {
      console.log("⚠️ Playwright not available, falling back to regular scraping")
      throw new Error("Playwright not available")
    }

    const { chromium } = playwright
    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      locale: 'en-US',
      acceptLanguage: 'en-US,en;q=0.9'
    })
    const page = await context.newPage()

    // Set user agent using the correct API
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })

    // Navigate to the page
    await page.goto(url, { waitUntil: 'networkidle' })
    
    // Wait for the .xieb3on container to appear
    await page.waitForSelector('.xieb3on', { timeout: 10000 })
    
    // Execute your exact JavaScript code
    const data = await page.evaluate(() => {
      const container = document.querySelector('.xieb3on');
      if (!container) {
        console.log("No .xieb3on container found");
        return null;
      }

      const data = {};

      // Extract name from page title or h1
      const pageTitle = document.querySelector('h1[data-testid="page_name"]')?.innerText?.trim() ||
                       document.querySelector('h1')?.innerText?.trim() ||
                       document.title?.split(' | ')[0]?.trim() ||
                       '';
      if (pageTitle) {
        data.name = pageTitle;
      }

      // About / description
      const about = container.querySelector('span');
      if (about) {
        data.about = about.innerText.trim();
      }

      // Category (get full text after 'Page')
      const strong = container.querySelector('strong');
      if (strong) {
        const fullText = strong.parentElement.innerText.trim();
        data.category = fullText.replace(/^Page\s*·\s*/i, ""); 
      }

      // Phone (look for digits)
      const phone = Array.from(container.querySelectorAll('span'))
        .map(el => el.innerText.trim())
        .find(t => /^\d{3,}/.test(t));
      if (phone) {
        data.phone = phone;
      }

      // Email (look for @)
      const email = Array.from(container.querySelectorAll('span'))
        .map(el => el.innerText.trim())
        .find(t => t.includes('@'));
      if (email) {
        data.email = email;
      }

      // Website
      const link = container.querySelector('a[href]');
      if (link) {
        let website = link.href;
        // Truncate very long URLs (like Facebook redirects)
        if (website.length > 50) {
          website = website.substring(0, 47) + '...';
        }
        data.website = website;
      }

      // Grab all possible visible text from the page
      const elements = document.querySelectorAll('span, div, strong, a');
      const texts = Array.from(elements)
        .map(el => el.innerText ? el.innerText.trim() : "")
        .filter(Boolean);

      // Regex patterns to match things like "1.8M followers" / "11 following" / "2.1M likes"
      texts.forEach(txt => {
        const lower = txt.toLowerCase();

        if (/([\d,.]+[kmb]?)\s*followers/.test(lower)) {
          data.followers = txt;
        }
        if (/([\d,.]+[kmb]?)\s*following/.test(lower)) {
          data.following = txt;
        }
        if (/([\d,.]+[kmb]?)\s*likes/.test(lower)) {
          data.likes = txt;
        }
      });

      console.log("📌 Extracted Data:", data);
      return data;
    })

    await browser.close()
    
    if (data) {
      console.log("✅ Playwright extraction successful:", data)
      return data
    } else {
      throw new Error("Failed to extract data with Playwright")
    }
    
  } catch (error) {
    console.error("❌ Playwright scraping failed:", error)
    throw error
  }
}

async function scrapeFacebookProfile(url: string) {
  console.log(" Using regular scraping fallback...")
  
  // Simple fallback - just return basic data
      return {
    name: "Facebook Page",
    category: "Unknown",
    description: "Unable to extract data - page may require login",
    address: "",
    phone: "",
    website: "",
    email: "",
    hours: [],
    rating: "",
    reviewCount: "",
    likes: "",
    followers: "",
    checkins: "",
    posts: [],
    profileUrl: url,
    extractedAt: new Date().toISOString()
  }
}

function parseFacebook($: cheerio.CheerioAPI, url: string): FacebookProfile {
  // Extract name
  const name = $('h1[data-testid="profile_name_in_profile_page"]').text().trim() ||
               $('h1[data-testid="profile_name"]').text().trim() ||
               $('h1').first().text().trim() ||
               $('title').text().split(' | ')[0] ||
               $('meta[property="og:title"]').attr('content') ||
               ""

  // Extract bio/description
  const bio = $('[data-testid="profile_about_section"]').text().trim() ||
              $('[data-testid="profile_bio"]').text().trim() ||
              $('.profile_bio').text().trim() ||
              $('meta[property="og:description"]').attr('content') ||
              ""

  // Extract location
  const location = $('[data-testid="profile_about_section"] [data-testid="profile_location"]').text().trim() ||
                   $('.profile_location').text().trim() ||
                   $('div:contains("Lives in")').text().trim() ||
                   ""

  // Extract website - look for external links
  const website = $('a[href^="http"]:not([href*="facebook.com"]):not([href*="maps.google.com"]):not([href^="mailto:"]):not([href^="tel:"])').first().attr('href') ||
                  $('[data-testid="profile_about_section"] a[href^="http"]').attr('href') ||
                  $('.profile_website a').attr('href') ||
                  ""

  // Extract followers
  const followers = $('span:contains("followers")').text().trim() ||
                    $('div:contains("followers")').text().trim() ||
                    $('[data-testid="profile_followers_count"]').text().trim() ||
                    ""

  // Extract following
  const following = $('span:contains("following")').text().trim() ||
                    $('div:contains("following")').text().trim() ||
                    $('[data-testid="profile_following_count"]').text().trim() ||
                    ""

      return {
    name,
    username: extractUsername(url),
    bio,
    location,
    website: website || "",
    followers,
    following,
    posts: [], // Skip posts for now
        about: {
      work: $('div:contains("Works at")').text().trim() || "",
      education: $('div:contains("Studied at")').text().trim() || "",
      relationship: $('div:contains("Relationship")').text().trim() || "",
      hometown: location
        },
        contact: {
      email: $('a[href^="mailto:"]').first().text().trim() || "",
      phone: $('a[href^="tel:"]').first().text().trim() || "",
    },
        profileUrl: url,
    extractedAt: new Date().toISOString()
  }
}

function parseFacebookPage($: cheerio.CheerioAPI, url: string): FacebookPage {
  // Extract name
  const name = $('h1[data-testid="page_name"]').text().trim() ||
               $('h1').first().text().trim() ||
               $('title').text().split(' | ')[0] ||
               $('meta[property="og:title"]').attr('content') ||
               ""

  // Find the main container with class .xieb3on
  const container = $('.xieb3on')
  
  console.log("Container found:", container.length > 0) // Debug log

  let category = ""
  let address = ""
  let phone = ""
  let email = ""
  let website = ""
  let rating = ""
  let hours = ""
  let likes = ""
  let followers = ""
  let description = ""

  if (container.length > 0) {
    // About / description (first span) - EXACTLY like your JS
    const about = container.find('span').first()
    if (about.length > 0) {
      description = about.text().trim()
      console.log("Description found:", description) // Debug log
    }

    // Category (get full text after 'Page') - EXACTLY like your JS
    const strong = container.find('strong')
    if (strong.length > 0) {
      const fullText = strong.parent().text().trim()
      category = fullText.replace(/^Page\s*·\s*/i, "")
      console.log("Category found:", category) // Debug log
    }

    // Phone (look for digits) - EXACTLY like your JS
    const phoneEl = container.find('span').filter((i, el) => {
      const text = $(el).text().trim()
      return /^\d{3,}/.test(text)
    }).first()
    if (phoneEl.length > 0) {
      phone = phoneEl.text().trim()
      console.log("Phone found:", phone) // Debug log
    }

    // Email (look for @) - EXACTLY like your JS
    const emailEl = container.find('span').filter((i, el) => {
      const text = $(el).text().trim()
      return text.includes('@')
    }).first()
    if (emailEl.length > 0) {
      email = emailEl.text().trim()
      console.log("Email found:", email) // Debug log
    }

    // Website - EXACTLY like your JS
    const link = container.find('a[href]').first()
    if (link.length > 0) {
      website = link.attr('href') || ""
      console.log("Website found:", website) // Debug log
    }

    // Extract likes and followers from the description
    if (description) {
      const likesMatch = description.match(/([\d,]+)\s*likes/)
      if (likesMatch) {
        likes = likesMatch[1] + " likes"
      }

      const followersMatch = description.match(/([\d,]+[KMB]?)\s*followers/)
      if (followersMatch) {
        followers = followersMatch[1] + " followers"
      }

      // Extract address (look for city names like "Mumbai")
      const addressMatch = description.match(/([^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+)/)
      if (addressMatch) {
        address = addressMatch[1].trim()
      } else {
        // Try simpler pattern for "Mumbai"
        const cityMatch = description.match(/([A-Za-z\s]+,\s*[A-Za-z\s]+)/)
        if (cityMatch) {
          address = cityMatch[1].trim()
        }
      }

      // Extract rating (look for percentage)
      const ratingMatch = description.match(/(\d+%\s*recommend)/)
      if (ratingMatch) {
        rating = ratingMatch[1]
      }

      // Extract hours (look for "Closed now" or "Open")
      const hoursMatch = description.match(/(Closed now|Open now|Open \d+:\d+)/)
      if (hoursMatch) {
        hours = hoursMatch[1]
      }
    }
  }

  return {
    name,
    category,
    description,
    address,
    phone,
    website: website || "",
    email,
    hours: hours ? [{ day: "Status", hours: hours }] : [],
    rating,
    reviewCount: "",
    likes,
    followers,
    checkins: "",
    posts: [],
    profileUrl: url,
    extractedAt: new Date().toISOString()
  }
}

function extractUsername(url: string): string {
  const match = url.match(/facebook\.com\/([^\/\?]+)/)
  return match ? match[1] : ""
}
