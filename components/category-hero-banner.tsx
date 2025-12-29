"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { subscribeToCategoryBannersConfig, type CategoryBannersConfig } from "@/lib/firebase-store-config"

interface CategoryHeroBannerProps {
  slug: "conjuntos" | "tops" | "calcinhas"
}

const fallbackConfig: CategoryBannersConfig = {
  conjuntos: {
    title: "Conjuntos",
    description: "Combinações perfeitas para o seu verão. Tops e calcinhas que combinam em harmonia.",
    image: "/vibrant-bikini-set.png",
    badge: "Coleção",
    enabled: true,
  },
  tops: {
    title: "Tops",
    description: "Monte seu look do seu jeito. Tops exclusivos para combinar com qualquer calcinha.",
    image: "/colorful-bikini-top.png",
    badge: "Coleção",
    enabled: true,
  },
  calcinhas: {
    title: "Calcinhas",
    description: "Modelos exclusivos com acabamento premium. Encontre o corte perfeito para você.",
    image: "/bikini-bottom.jpg",
    badge: "Coleção",
    enabled: true,
  },
}

export function CategoryHeroBanner({ slug }: CategoryHeroBannerProps) {
  const [config, setConfig] = useState<CategoryBannersConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeToCategoryBannersConfig((data) => {
      setConfig(data)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) {
    return (
      <section className="relative pt-32 pb-20 bg-secondary/30">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  const category = config?.[slug] || fallbackConfig[slug]

  if (!category.enabled) {
    return null
  }

  return (
    <section className="relative pt-32 pb-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            {category.badge && (
              <span className="text-primary text-sm uppercase tracking-[0.3em]">{category.badge}</span>
            )}
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">{category.title}</h1>
            <p className="text-lg text-muted-foreground max-w-md">{category.description}</p>
          </div>
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
            <img
              src={category.image || "/placeholder.svg"}
              alt={category.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}
