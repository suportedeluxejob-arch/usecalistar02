"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Waves, Shell, Loader2 } from "lucide-react"
import { subscribeToHeroConfig, type HeroConfig } from "@/lib/firebase-store-config"

export function HeroSection() {
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<HeroConfig | null>(null)

  useEffect(() => {
    const unsub = subscribeToHeroConfig((data) => {
      setConfig(data)
      setLoading(false)
    })
    return unsub
  }, [])

  // Show loading state
  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    )
  }

  // If disabled, don't render
  if (!config?.enabled) {
    return null
  }

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8">
            {config.badge && (
              <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-secondary-foreground">{config.badge}</span>
              </div>
            )}

            <h2 className="text-5xl md:text-7xl font-bold leading-tight text-foreground">
              {config.title}
              <span className="block text-primary italic">{config.titleHighlight}</span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed">{config.subtitle}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="rounded-full px-8 text-base group">
                Ver Coleção
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 text-base bg-transparent">
                Shop the Look
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{config.stat1Value}</div>
                <div className="text-sm text-muted-foreground">{config.stat1Label}</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{config.stat2Value}</div>
                <div className="text-sm text-muted-foreground">{config.stat2Label}</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{config.stat3Value}</div>
                <div className="text-sm text-muted-foreground">{config.stat3Label}</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative aspect-[3/4] max-w-lg mx-auto">
              {/* Main image frame */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] rotate-3" />
              <div className="absolute inset-0 bg-card rounded-[3rem] shadow-2xl overflow-hidden -rotate-2">
                <img
                  src={config.mainImage || "/images/photo-2025-12-21-21-01-36.jpg"}
                  alt="Modelo usando biquíni da coleção verão"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="absolute -left-8 top-1/4 bg-card p-4 rounded-2xl shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Waves className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Novidades</div>
                    <div className="text-xs text-muted-foreground">Chegaram</div>
                  </div>
                </div>
              </div>

              <div
                className="absolute -right-4 bottom-1/3 bg-card p-4 rounded-2xl shadow-xl animate-float"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/30 rounded-full flex items-center justify-center">
                    <Shell className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Biquínis</div>
                    <div className="text-xs text-muted-foreground">8 novos</div>
                  </div>
                </div>
              </div>

              {config.secondaryImage && (
                <div
                  className="absolute -left-12 bottom-1/4 w-24 h-32 rounded-xl overflow-hidden shadow-xl border-4 border-card animate-float hidden md:block"
                  style={{ animationDelay: "0.5s" }}
                >
                  <img
                    src={config.secondaryImage || "/placeholder.svg"}
                    alt="Modelo usando biquíni verde oliva"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              )}

              {config.discountText && (
                <div className="absolute -bottom-4 left-1/4 bg-primary text-primary-foreground p-4 rounded-2xl shadow-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{config.discountText}</div>
                    <div className="text-xs uppercase tracking-wide">{config.discountSubtext}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
