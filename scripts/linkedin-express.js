// Standalone Express + Playwright server for LinkedIn profile scraping
// NOTE: For local testing only. Do NOT commit real credentials.

const express = require("express")
const cors = require("cors")
const { chromium } = require("playwright")

const app = express()
app.use(cors())
app.use(express.json())

async function scrapeLinkedInProfile(url) {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  // Login to LinkedIn (TEMP hardcoded for local testing)
  await page.goto("https://www.linkedin.com/login")
  await page.fill("#username", process.env.LI_EMAIL || "control400422@gmail.com")
  await page.fill("#password", process.env.LI_PASSWORD || "PS@4100422")
  await page.click('[type="submit"]')
  await page.waitForLoadState("networkidle").catch(() => null)

  // Visit the profile
  await page.goto(url, { waitUntil: "networkidle" })

  const profile = {}
  profile.name = await page.locator("h1").first().innerText().catch(() => null)
  profile.headline = await page.locator(".text-body-medium").first().innerText().catch(() => null)
  profile.location = await page
    .locator(".text-body-small.inline.t-black--light.break-words")
    .first()
    .innerText()
    .catch(() => null)

  const texts = await page.locator(".t-black--light").allInnerTexts().catch(() => [])
  profile.connections = texts.find((t) => t.includes("connections")) || null
  profile.followers = texts.find((t) => t.includes("followers")) || null

  profile.currentCompany = await page
    .locator("button[aria-label^='Current company']")
    .first()
    .innerText()
    .catch(() => null)
  profile.education = await page
    .locator("button[aria-label^='Education']")
    .first()
    .innerText()
    .catch(() => null)

  await browser.close()
  return profile
}

app.post("/scrape", async (req, res) => {
  const { url } = req.body || {}
  if (!url) return res.status(400).json({ error: "url is required" })
  try {
    const data = await scrapeLinkedInProfile(url)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err?.message || String(err) })
  }
})

// Google Maps place scraper using provided tags/selectors
app.post("/scrape-maps", async (req, res) => {
  const { url } = req.body || {}
  if (!url) return res.status(400).json({ error: "url is required" })
  let browser
  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(url, { waitUntil: "domcontentloaded" })
    await page.waitForTimeout(1200)

    const result = await page.evaluate(() => {
      const textOf = (el) => (el?.textContent || "").trim()

      // Find the anchor whose child span has text 'Website'
      let websiteUrl = ""
      document.querySelectorAll("a.n1obkb.mI8Pwc").forEach((a) => {
        const span = a.querySelector(".PbOY2e")
        if (span && /website/i.test(textOf(span))) {
          websiteUrl = a.getAttribute("href") || ""
        }
      })

      // Reviews link: anchor whose span text is 'Reviews'
      let reviewsLink = ""
      document.querySelectorAll("a.n1obkb.mI8Pwc").forEach((a) => {
        const span = a.querySelector(".PbOY2e")
        if (span && /reviews?/i.test(textOf(span))) {
          reviewsLink = a.getAttribute("href") || ""
        }
      })

      // Address from SERP sidebar block
      const addressEl = document.querySelector('[data-attrid="kc:/location/location:address"] .LrzXr')
      const address = textOf(addressEl)

      // Phone number (SERP sidebar or action button)
      let phone = ""
      const phoneAttr = document.querySelector('[data-phone-number]')
      if (phoneAttr) phone = phoneAttr.getAttribute('data-phone-number') || ""
      if (!phone) {
        const phoneSpan = document.querySelector('[data-attrid="kc:/local:alt phone"] .LrzXr span[aria-label^="Call phone number"]')
        if (phoneSpan) phone = textOf(phoneSpan)
      }

      // Directions: element with span text 'Directions' (may not be an anchor)
      let hasDirections = false
      document.querySelectorAll(".n1obkb.mI8Pwc,.Od1FEc.n1obkb").forEach((el) => {
        const span = el.querySelector(".PbOY2e")
        if (span && /directions/i.test(textOf(span))) hasDirections = true
      })

      return { websiteUrl, reviewsLink, phone, address, hasDirections }
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err?.message || String(err) })
  } finally {
    try { await browser?.close() } catch {}
  }
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`✅ Backend running on http://localhost:${port}`))


