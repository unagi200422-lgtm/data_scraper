import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/lib/icons"

const features = [
  {
    icon: Icons.Linkedin,
    title: "LinkedIn Profile Scraping",
    description:
      "Extract comprehensive profile data including contact information, work history, and connections from LinkedIn profiles.",
  },
  {
    icon: Icons.Building2,
    title: "Google Business Listings",
    description:
      "Gather business information, reviews, contact details, and location data from Google My Business listings.",
  },
  {
    icon: Icons.Facebook,
    title: "Facebook Page Data",
    description:
      "Collect page information, contact details, and business data from Facebook business pages and profiles.",
  },
  {
    icon: Icons.FileSpreadsheet,
    title: "Excel Export",
    description:
      "Automatically format and export all scraped data into organized Excel spreadsheets ready for analysis.",
  },
  {
    icon: Icons.Shield,
    title: "Compliant & Secure",
    description:
      "All scraping is done ethically and in compliance with platform terms of service and data protection regulations.",
  },
  {
    icon: Icons.Zap,
    title: "Fast & Reliable",
    description: "High-speed data extraction with built-in retry mechanisms and error handling for consistent results.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Powerful Data Extraction Tools
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Everything you need to gather business intelligence from major social platforms
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
