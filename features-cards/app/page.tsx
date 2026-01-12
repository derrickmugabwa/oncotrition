import { FeatureCard } from "@/components/feature-card"
import { ArrowRight, Zap, Shield, BarChart3, Users, Workflow, Sparkles } from "lucide-react"

export const metadata = {
  title: "Features",
  description: "Discover our powerful features designed to transform your business",
}

export default function FeaturesPage() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Experience blazing-fast performance with optimized systems built for speed and reliability.",
      color: "primary",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your data is protected with enterprise-grade encryption and security protocols.",
      color: "accent",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Gain deep insights with comprehensive analytics and real-time reporting dashboards.",
      color: "primary",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Seamlessly work together with powerful collaboration tools and shared workspaces.",
      color: "accent",
    },
    {
      icon: Workflow,
      title: "Automation",
      description: "Automate repetitive tasks and workflows to focus on what truly matters.",
      color: "primary",
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Leverage cutting-edge AI technology to unlock new possibilities and efficiencies.",
      color: "accent",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-6xl sm:text-7xl font-bold text-foreground mb-8 text-balance">What you can do</h1>
          <p className="text-xl text-muted-foreground max-w-3xl text-pretty">
            Explore the full range of capabilities that make our platform the choice for teams worldwide.
          </p>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6 text-balance">See it in action</h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            Take a personalized tour and discover how to unlock your team's full potential.
          </p>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity">
            Schedule Demo
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  )
}
