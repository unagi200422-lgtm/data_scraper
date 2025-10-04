// Real web scraping utility using Puppeteer-like functionality
// Note: In a production environment, you'd use actual Puppeteer or Playwright

interface ScrapingOptions {
  waitForSelector?: string
  timeout?: number
  userAgent?: string
  viewport?: { width: number; height: number }
}

export class BrowserScraper {
  private static defaultOptions: ScrapingOptions = {
    timeout: 30000,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
  }

  static async scrapeWithRetry(url: string, options: ScrapingOptions = {}): Promise<string> {
    const opts = { ...this.defaultOptions, ...options }
    let lastError: Error | null = null

    // Try multiple approaches for robust scraping
    const strategies = [
      () => this.fetchWithPlaywright(url, opts),
      () => this.fetchWithHeaders(url, opts),
      () => this.fetchWithProxy(url, opts),
      () => this.fetchWithDelay(url, opts),
    ]

    for (const strategy of strategies) {
      try {
        console.log("[v0] Attempting scraping strategy...")
        const html = await strategy()
        if (html && html.length > 1000) {
          // Basic content validation
          console.log("[v0] Successfully scraped content")
          return html
        }
      } catch (error) {
        console.log("[v0] Strategy failed:", error)
        lastError = error as Error
        // Wait before trying next strategy
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    throw lastError || new Error("All scraping strategies failed")
  }

  private static async fetchWithPlaywright(url: string, options: ScrapingOptions): Promise<string> {
    // Use Playwright if available to render dynamic content (optional dependency)
    try {
      console.log("✅ LinkedIn scraper: Playwright enabled - attempting to scrape with Playwright")

      // Prefer require to avoid Next bundler dynamic import issues
      let playwright: any = null
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        playwright = require("playwright")
      } catch {}
      if (!playwright || !playwright.chromium) throw new Error("Playwright not installed")

      const browserlessKey = process.env.BROWSERLESS_API_KEY
      const useBrowserless = !!browserlessKey

      let browser: any
      if (useBrowserless) {
        const wsEndpoint = `wss://chrome.browserless.io/playwright?token=${browserlessKey}`
        // Some deployments require plain endpoint without /playwright; this works for most current setups
        browser = await playwright.chromium.connect({ wsEndpoint })
      } else {
        browser = await playwright.chromium.launch({ headless: true })
      }

      const context = await browser.newContext({
        userAgent: options.userAgent,
        viewport: options.viewport,
      })
      const page = await context.newPage()
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: options.timeout })

      // Attempt to wait for meaningful content
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { timeout: options.timeout }).catch(() => null)
      }

      // Heuristics for LinkedIn: expand experiences if present
      try {
        await page.waitForTimeout(1500)
        const showAllButtons = await page.locator("button:has-text('Show all'), button:has-text('See more')").all()
        for (const btn of showAllButtons) {
          try {
            await btn.click({ timeout: 1000 })
          } catch {}
        }
        // Scroll to load lazy content
        for (let i = 0; i < 6; i++) {
          await page.mouse.wheel(0, 1200)
          await page.waitForTimeout(500)
        }
      } catch {}

      const content = await page.content()
      await browser.close()
      return content
    } catch (err) {
      throw err instanceof Error ? err : new Error("Playwright strategy failed")
    }
  }

  private static async fetchWithHeaders(url: string, options: ScrapingOptions): Promise<string> {
    const response = await fetch(url, {
      headers: {
        "User-Agent": options.userAgent!,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.text()
  }

  private static async fetchWithProxy(url: string, options: ScrapingOptions): Promise<string> {
    // In a real implementation, you'd rotate through proxy servers
    // For now, we'll add additional headers to appear more legitimate
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.google.com/",
        DNT: "1",
        Connection: "keep-alive",
      },
    })

    if (!response.ok) {
      throw new Error(`Proxy fetch failed: ${response.status}`)
    }

    return await response.text()
  }

  private static async fetchWithDelay(url: string, options: ScrapingOptions): Promise<string> {
    // Add random delay to appear more human-like
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 3000 + 1000))

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    })

    if (!response.ok) {
      throw new Error(`Delayed fetch failed: ${response.status}`)
    }

    return await response.text()
  }

  static async evaluateWithPlaywright<T = any>(
    url: string,
    evaluator: (page: any) => Promise<T>,
    options: ScrapingOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options }
    try {
      let playwright: any = null
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        playwright = require("playwright")
      } catch {}
      if (!playwright || !playwright.chromium) throw new Error("Playwright not installed")

      const browserlessKey = process.env.BROWSERLESS_API_KEY
      const useBrowserless = !!browserlessKey

      let browser: any
      if (useBrowserless) {
        const wsEndpoint = `wss://chrome.browserless.io/playwright?token=${browserlessKey}`
        browser = await playwright.chromium.connect({ wsEndpoint })
      } else {
        browser = await playwright.chromium.launch({ headless: true })
      }

      const context = await browser.newContext({
        userAgent: opts.userAgent,
        viewport: opts.viewport,
      })
      const page = await context.newPage()
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: opts.timeout })

      if (opts.waitForSelector) {
        await page.waitForSelector(opts.waitForSelector, { timeout: opts.timeout }).catch(() => null)
      }

      // Light scroll to trigger lazy content
      try {
        for (let i = 0; i < 3; i++) {
          await page.mouse.wheel(0, 800)
          await page.waitForTimeout(400)
        }
      } catch {}

      const result = await evaluator(page)
      await browser.close()
      return result
    } catch (err) {
      throw err instanceof Error ? err : new Error("Playwright evaluate failed")
    }
  }

  static async evaluateWithPlaywrightLogin<T = any>(
    login: { email: string; password: string },
    url: string,
    evaluator: (page: any) => Promise<T>,
    options: ScrapingOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options }
    try {
      // @ts-ignore
      const moduleName = ["play", "wright"].join("")
      // @ts-ignore
      const mod = await import(moduleName as any).catch(() => null)
      if (!mod || !mod.chromium) throw new Error("Playwright not installed")
      const playwright: any = mod

      const browser = await playwright.chromium.launch({ headless: false })
      const context = await browser.newContext({
        userAgent: opts.userAgent,
        viewport: opts.viewport,
      })
      const page = await context.newPage()

      await page.goto("https://www.linkedin.com/login", { waitUntil: "domcontentloaded", timeout: opts.timeout })
      await page.fill("#username", login.email)
      await page.fill("#password", login.password)
      await page.click('button[type="submit"]')
      await page.waitForLoadState("networkidle").catch(() => null)

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: opts.timeout })
      if (opts.waitForSelector) {
        await page.waitForSelector(opts.waitForSelector, { timeout: opts.timeout }).catch(() => null)
      }

      try {
        for (let i = 0; i < 3; i++) {
          await page.mouse.wheel(0, 900)
          await page.waitForTimeout(400)
        }
      } catch {}

      const result = await evaluator(page)
      await browser.close()
      return result
    } catch (err) {
      throw err instanceof Error ? err : new Error("Playwright login evaluate failed")
    }
  }
}
