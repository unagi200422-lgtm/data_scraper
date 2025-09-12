import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ScrapingToolSection } from "@/components/scraping-tool-section"
import { ResultsDashboard } from "@/components/results-dashboard"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <div className="flex flex-col items-center">
          <HeroSection />
          <ScrapingToolSection />
          <ResultsDashboard />
          <FeaturesSection />
          <HowItWorksSection />
          <TestimonialsSection />
        </div>
      </main>
      <Footer />
    </div>
  )
}
