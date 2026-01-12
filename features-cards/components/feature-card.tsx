"use client"

import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  color: "primary" | "accent"
}

export function FeatureCard({ icon: Icon, title, description, color }: FeatureCardProps) {
  const colorClasses = {
    primary: "bg-teal-500/15 text-teal-600",
    accent: "bg-emerald-500/15 text-emerald-600",
  }

  return (
    <div className="group relative h-full rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 p-7 transition-all duration-300 hover:shadow-xl hover:border-teal-400 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/3 via-transparent to-emerald-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />

      <div className="relative z-10">
        <div
          className={`w-16 h-16 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-5 group-hover:scale-125 transition-transform duration-300`}
        >
          <Icon className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-bold text-card-foreground mb-3 group-hover:text-teal-600 transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>

        <div className="mt-6 flex items-center gap-2 text-teal-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>Explore</span>
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </div>
  )
}
