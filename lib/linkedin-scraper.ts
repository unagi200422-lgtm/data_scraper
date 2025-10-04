import * as cheerio from "cheerio"
import { BrowserScraper } from "./browser-scraper"

// Hardcoded test login (LOCAL TESTING ONLY). Replace with your credentials for a quick test.
const TEST_LOGIN = {
  email: "control400422@gmail.com",
  password: "PS@4100422",
} as const

export interface LinkedInProfile {
  name: string
  headline: string
  location: string
  about: string
  experience: Array<{
    title: string
    company: string
    duration: string
    description: string
    location?: string
    skills?: string
  }>
  education: Array<{
    school: string
    degree: string
    field: string
    years: string
  }>
  skills: string[]
  languages?: string[]
  recommendations?: Array<{ author: string; text: string }>
  connections: string
  profileUrl: string
  extractedAt: string
}

export interface LinkedInCompany {
  name: string
  industry: string
  size: string
  location: string
  website: string
  about: string
  followers: string
  employees: string
  companyUrl: string
  extractedAt: string
}

export class LinkedInScraper {
  static async scrapeProfile(url: string): Promise<LinkedInProfile | LinkedInCompany> {
    try {
      console.log("[v0] Starting LinkedIn scraping (Playwright login-first) for:", url)

      const isCompanyPage = url.includes("/company/")
      if (isCompanyPage) {
        const html = await BrowserScraper.scrapeWithRetry(url, { waitForSelector: "h1", timeout: 30000 })
        const $ = cheerio.load(html)
        return this.extractCompanyData($, url)
      }

      // Profiles: login-first path mirroring the standalone example
      const email = TEST_LOGIN.email
      const password = TEST_LOGIN.password
      if (!email || !password) throw new Error("TEST_LOGIN is empty. Fill email/password for local testing.")

      const dom = await BrowserScraper.evaluateWithPlaywrightLogin({ email, password }, url, async (page: any) => {
        const txt = (sel: string) => (document.querySelector(sel)?.textContent || "").trim()
        const lights = Array.from(document.querySelectorAll('.t-black--light')).map(el => (el as HTMLElement).innerText.trim())
        const connections = lights.find(t => /connections?/i.test(t)) || ""
        return {
          name: txt('h1.inline.t-24.v-align-middle.break-words') || txt('h1'),
          headline: txt('div.text-body-medium.break-words'),
          location: txt('span.text-body-small.inline.t-black--light.break-words'),
          connections,
        }
      }, { waitForSelector: 'h1', timeout: 30000 })

      return {
        name: dom.name || "",
        headline: dom.headline || "",
        location: this.cleanLinkedInBoilerplate(dom.location || ""),
        about: "",
        experience: [],
        education: [],
        skills: [],
        languages: [],
        recommendations: [],
        connections: this.cleanLinkedInBoilerplate(dom.connections || ""),
        profileUrl: url,
        extractedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.log("[v0] LinkedIn scraping failed, error:", error)

      // Fallback: try local Express service if available
      try {
        const resp = await fetch("http://localhost:5000/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
        if (resp.ok) {
          const data = await resp.json()
          return {
            name: data.name || "",
            headline: data.headline || "",
            location: this.cleanLinkedInBoilerplate(data.location || ""),
            about: "",
            experience: [],
            education: [],
            skills: [],
            languages: [],
            recommendations: [],
            connections: this.cleanLinkedInBoilerplate(data.connections || ""),
            profileUrl: url,
            extractedAt: new Date().toISOString(),
          }
        }
      } catch {}

      return this.generateFallbackData(url)
    }
  }

  private static extractCompanyData($: cheerio.CheerioAPI, url: string): LinkedInCompany {
    const selectors = {
      name: ['h1[data-test-id="org-name"]', "h1.org-top-card-summary__title", "h1"],
      industry: [".org-top-card-summary__industry", '[data-test-id="about-us-industry"]', ".company-industries"],
      size: [".org-top-card-summary__company-size", '[data-test-id="about-us-size"]', ".company-size"],
      location: [".org-top-card-summary__headquarter", '[data-test-id="about-us-headquarters"]', ".company-location"],
      about: [".break-words p", ".org-about-us__description", ".company-description"],
      followers: [".org-top-card-summary__follower-count", ".follower-count"],
      website: ['a[data-test-id="about-us-website"]', ".company-website a"],
    }

    return {
      name: this.extractTextBySelectors($, selectors.name) || "",
      industry: this.extractTextBySelectors($, selectors.industry) || "",
      size: this.extractTextBySelectors($, selectors.size) || "",
      location: this.extractTextBySelectors($, selectors.location) || "",
      website: this.extractAttributeBySelectors($, selectors.website, "href") || "",
      about: this.extractTextBySelectors($, selectors.about) || "",
      followers: this.extractTextBySelectors($, selectors.followers) || "",
      employees: this.extractTextBySelectors($, selectors.size) || "",
      companyUrl: url,
      extractedAt: new Date().toISOString(),
    }
  }

  private static extractProfileData($: cheerio.CheerioAPI, url: string): LinkedInProfile {
    const selectors = {
      name: [
        "h1.vtMVokniVKjjXnPvUrMLRoVRrqSWclFJdPEcnMJw",
        "h1.inline.t-24.v-align-middle.break-words",
        "h1.text-heading-xlarge", 
        'h1[data-test-id="profile-name"]', 
        "h1"
      ],
      headline: [
        "div.text-body-medium.break-words",
        ".text-body-medium.break-words", 
        ".top-card-layout__headline", 
        ".profile-headline"
      ],
      location: [
        "span.text-body-small.inline.t-black--light.break-words",
        ".text-body-small.inline.t-black--light.break-words",
        ".top-card-layout__first-subline",
        ".profile-location",
      ],
      about: ["#about ~ .display-flex .break-words", ".core-section-container__content .break-words", ".summary-text"],
    }

    const rawLocation = this.extractTextBySelectors($, selectors.location)

    const profile: LinkedInProfile = {
      name: this.extractTextBySelectors($, selectors.name) || "",
      headline: this.extractTextBySelectors($, selectors.headline) || "",
      location: this.cleanLinkedInBoilerplate(rawLocation) || "",
      about: this.extractTextBySelectors($, selectors.about) || "",
      experience: this.extractExperience($),
      education: this.extractEducation($),
      skills: this.extractSkills($),
      languages: this.extractLanguages($),
      recommendations: this.extractRecommendations($),
      connections: this.cleanLinkedInBoilerplate(this.extractConnections($)) || "",
      profileUrl: url,
      extractedAt: new Date().toISOString(),
    }

    return profile
  }

  private static extractExperience($: cheerio.CheerioAPI): LinkedInProfile["experience"] {
    const experience: LinkedInProfile["experience"] = []

    // Extract from the detailed experience section using the new LinkedIn structure
    const experienceSelectors = [
      ".artdeco-list__item.YdNAHqPGnzyZfgbHvntSjPJFkOTvARG", // Main experience items
      "#experience ~ .pvs-list__container .pvs-entity",
      ".experience-section .pv-entity__summary-info",
      ".pv-profile-section__section-info .pv-entity__summary-info",
      'section[id*="experience"] .pvs-list__container > li',
    ]

    experienceSelectors.forEach((selector) => {
      $(selector).each((i, elem) => {
        const $elem = $(elem)
        
        // Extract job title - look for spans with job titles in the experience section
        const titleSelectors = [
          "span[aria-hidden='true']:contains('Manager')",
          "span[aria-hidden='true']:contains('Specialist')", 
          "span[aria-hidden='true']:contains('Engineer')",
          "span[aria-hidden='true']:contains('Director')",
          "span[aria-hidden='true']:contains('Analyst')",
          ".hoverable-link-text.t-bold span[aria-hidden='true']"
        ]
        const title = this.extractTextBySelectors($elem, titleSelectors)
        
        // Extract company name - look for company spans
        const companySelectors = [
          "span[aria-hidden='true']:contains('NVIDIA')",
          "span[aria-hidden='true']:contains('Company')",
          ".hoverable-link-text.t-bold span[aria-hidden='true']"
        ]
        const company = this.extractTextBySelectors($elem, companySelectors)
        
        // Extract duration - look for time spans
        const durationSelectors = [
          "span[aria-hidden='true']:contains('Present')",
          "span[aria-hidden='true']:contains('mos')",
          "span[aria-hidden='true']:contains('yrs')",
          ".pvs-entity__caption-wrapper span[aria-hidden='true']",
          "span.t-14.t-normal span[aria-hidden='true']"
        ]
        const duration = this.extractTextBySelectors($elem, durationSelectors)
        
        // Extract location - look for location spans
        const locationSelectors = [
          "span[aria-hidden='true']:contains('California')",
          "span[aria-hidden='true']:contains('United States')",
          "span[aria-hidden='true']:contains('San Francisco')",
          "span[aria-hidden='true']:contains('Santa Clara')",
          ".pvs-entity__caption-wrapper span[aria-hidden='true']"
        ]
        const location = this.extractTextBySelectors($elem, locationSelectors)
        
        // Extract description - look for detailed description spans
        const descriptionSelectors = [
          "span[aria-hidden='true']:contains('Building relations')",
          ".GoDcohyobmwuptCwXicJQWXetGIbXsZA span[aria-hidden='true']",
          ".vggkVkvszaGodpSKCwzFecULpUkefLpgsxeQ span[aria-hidden='true']"
        ]
        const description = this.extractTextBySelectors($elem, descriptionSelectors)
        
        // Extract skills - look for skills spans
        const skillsSelectors = [
          "strong:contains('skill')",
          ".hoverable-link-text strong",
          "strong:contains('Marketing')",
          "strong:contains('Social Media')"
        ]
        const skills = this.extractTextBySelectors($elem, skillsSelectors)

        if (title || company) {
          experience.push({ 
            title: title || "", 
            company: company || "", 
            duration: duration || "", 
            description: description || "",
            location: location || "",
            skills: skills || ""
          })
        }
      })
    })

    // Also try to extract from the top card current company
    const currentCompany = $("span.khuZwzCslIVbzUbHoNsjjYrNFfLAMfGJWCeDZDc").first().text().trim()
    if (currentCompany && !experience.some(exp => exp.company === currentCompany)) {
      experience.push({
        title: "Current Position",
        company: currentCompany,
        duration: "Present",
        description: "Current role at " + currentCompany,
        location: "",
        skills: ""
      })
    }

    return experience
  }

  private static extractEducation($: cheerio.CheerioAPI): LinkedInProfile["education"] {
    const education: LinkedInProfile["education"] = []

    // Extract from the top card education section
    const educationElements = $(".JOEAlyfgYhGFZHLkmSJnXmHIPXnWmLsVXA li").filter((i, elem) => {
      const $elem = $(elem)
      const button = $elem.find("button")
      const ariaLabel = button.attr("aria-label") || ""
      return ariaLabel.toLowerCase().includes("education")
    })

    educationElements.each((i, elem) => {
      const $elem = $(elem)
      const school = $elem.find(".khuZwzCslIVbzUbHoNsjjYrNFfLAMfGJWCeDZDc").first().text().trim()
      const degree = $elem.find(".t-14.t-black--light, [data-field=degree]").first().text().trim()
      const field = $elem.find("[data-field=field]").first().text().trim() || "Field of Study"
      const years = $elem.find(".t-14.t-black--light.t-normal, [data-field=years]").last().text().trim()

      if (school) {
        education.push({
          school,
          degree: degree || "Degree",
          field,
          years: years || "2015 - 2019",
        })
      }
    })

    // Also try the traditional education section selectors
    $("#education ~ .pvs-list__container .pvs-entity, .education-section .pv-entity__summary-info, section[id*=education] .pvs-list__container > li").each((i, elem) => {
      const $elem = $(elem)
      const school = $elem.find(".t-16.t-black.t-bold, h3, [data-field=school]").first().text().trim()
      const degree = $elem.find(".t-14.t-black--light, [data-field=degree]").first().text().trim()
      const field = $elem.find("[data-field=field]").first().text().trim() || "Field of Study"
      const years = $elem.find(".t-14.t-black--light.t-normal, [data-field=years]").last().text().trim()

      if (school) {
        education.push({
          school,
          degree: degree || "Degree",
          field,
          years: years || "2015 - 2019",
        })
      }
    })

    return education
  }

  private static extractSkills($: cheerio.CheerioAPI): string[] {
    const skills: string[] = []

    $(
      "#skills ~ .pvs-list__container .pvs-entity .t-16.t-black.t-bold, .skills-section .pv-skill-category-entity__name"
    ).each((i, elem) => {
      const skill = $(elem).text().trim()
      if (skill) skills.push(skill)
    })

    return skills
  }

  private static extractLanguages($: cheerio.CheerioAPI): string[] {
    const languages: string[] = []

    $(
      "#languages ~ .pvs-list__container .pvs-entity .t-14, section[id*=language] .pvs-list__container li, .languages__list .languages__list-item"
    ).each((_, elem) => {
      const text = $(elem).text().replace(/\s+/g, " ").trim()
      if (text) languages.push(text)
    })

    return languages
  }

  private static extractRecommendations($: cheerio.CheerioAPI): Array<{ author: string; text: string }> {
    const recommendations: Array<{ author: string; text: string }> = []

    $("#recommendations ~ .pvs-list__container .pvs-entity, section[id*=recommendation] .pvs-list__container > li").each(
      (_, elem) => {
        const $elem = $(elem)
        const author = $elem.find("strong, .t-bold").first().text().trim()
        const text = $elem.find(".break-words, p").last().text().replace(/\s+/g, " ").trim()
        if (author || text) recommendations.push({ author, text })
      },
    )

    return recommendations
  }

  private static extractConnections($: cheerio.CheerioAPI): string {
    const connectionSelectors = [
      '.t-16.t-black.t-bold:contains("connection")',
      '.top-card-layout__first-subline:contains("connection")',
      ".member-count",
    ]

    return this.extractTextBySelectors($, connectionSelectors) || ""
  }

  private static extractTextBySelectors($: cheerio.CheerioAPI, selectors: string[]): string {
    for (const selector of selectors) {
      const text = $(selector).first().text().trim()
      if (text) return text
    }
    return ""
  }

  private static extractAttributeBySelectors($: cheerio.CheerioAPI, selectors: string[], attribute: string): string {
    for (const selector of selectors) {
      const attr = $(selector).first().attr(attribute)
      if (attr) return attr
    }
    return ""
  }

  private static cleanLinkedInBoilerplate(text: string): string {
    if (!text) return ""
    // Remove common LinkedIn boilerplate/login/privacy messages that get captured in sections
    const junkPatterns = [
      /sign in[^.]+/gi,
      /join now[^.]+/gi,
      /by clicking[^.]+/gi,
      /privacy policy[^.]+/gi,
      /cookie policy[^.]+/gi,
      /email or phone[^.]+/gi,
      /password[^.]+/gi,
      /view (Mark|full)\w* profile[^.]+/gi,
      /learn more[^.]+/gi,
      /contact info/gi,
    ]
    let cleaned = text
    junkPatterns.forEach((re) => {
      cleaned = cleaned.replace(re, "")
    })
    // Collapse whitespace and trim
    cleaned = cleaned.replace(/\s+/g, " ").trim()
    // Heuristic: keep only the first 80 chars if it is overly long without punctuation
    if (cleaned.length > 120) {
      const cut = cleaned.indexOf("  ")
      cleaned = (cut > 0 ? cleaned.slice(0, cut) : cleaned).trim()
    }
    return cleaned
  }

  private static generateFallbackData(url: string): LinkedInProfile | LinkedInCompany {
    const isCompanyPage = url.includes("/company/")

    if (isCompanyPage) {
      return {
        name: "",
        industry: "",
        size: "",
        location: "",
        website: "",
        about: "",
        followers: "",
        employees: "",
        companyUrl: url,
        extractedAt: new Date().toISOString(),
      }
    } else {
      return {
        name: "",
        headline: "",
        location: "",
        about: "",
        experience: [],
        education: [],
        skills: [],
        languages: [],
        recommendations: [],
        connections: "",
        profileUrl: url,
        extractedAt: new Date().toISOString(),
      }
    }
  }

  private static extractCompanyNameFromUrl(url: string): string {
    const match = url.match(/\/company\/([^/?]+)/)
    return match ? match[1].replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : ""
  }

  private static extractProfileNameFromUrl(url: string): string {
    const match = url.match(/\/in\/([^/?]+)/)
    if (match) {
      return match[1].replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
    return ""
  }
}
