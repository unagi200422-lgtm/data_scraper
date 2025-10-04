import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/lib/icons"

const steps = [
  {
    icon: Icons.Link,
    title: "Paste URL",
    description: "Simply paste the LinkedIn, Google Business, or Facebook URL you want to scrape data from.",
    step: "01",
  },
  {
    icon: Icons.Search,
    title: "Extract Data",
    description: "Our advanced scraping engine automatically extracts all available contact and business information.",
    step: "02",
  },
  {
    icon: Icons.Download,
    title: "Download Excel",
    description: "Get your organized data in a clean Excel spreadsheet ready for your business needs.",
    step: "03",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">Get your data in three simple steps</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="bg-card border-border text-center">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                    {step.step}
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{step.description}</CardDescription>
                </CardContent>
              </Card>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
