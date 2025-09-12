import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"

export function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance">
            Extract Data from <span className="text-primary">LinkedIn</span>,{" "}
            <span className="text-secondary">Google Business</span> & <span className="text-accent">Facebook</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto text-pretty">
            Professional data scraping tools that help you extract valuable contact information and business data from
            social platforms. Export everything to Excel with just a few clicks.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Start Scraping Now
              <Icons.ArrowRight />
            </Button>
            <Button variant="outline" size="lg" className="gap-2 bg-transparent">
              <Icons.Play />
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl opacity-20">
          <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary to-secondary" />
        </div>
      </div>
    </section>
  )
}
