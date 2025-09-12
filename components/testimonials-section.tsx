import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/lib/icons"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Sales Manager",
    company: "TechCorp",
    content:
      "DataScraper Pro has revolutionized our lead generation process. We can now extract hundreds of LinkedIn profiles in minutes instead of hours.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Marketing Director",
    company: "GrowthLabs",
    content:
      "The Google Business scraping feature is incredible. We use it to analyze competitors and find new business opportunities in our area.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Business Analyst",
    company: "DataDriven Inc",
    content:
      "Clean, organized Excel exports make our data analysis so much easier. The tool pays for itself with the time it saves us.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Trusted by Professionals</h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            See what our customers say about DataScraper Pro
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Icons.Star key={i} />
                  ))}
                </div>
                <blockquote className="text-muted-foreground mb-4">"{testimonial.content}"</blockquote>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
