"use client"

import { useState, useEffect } from "react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { subscribeToProducts } from "@/lib/firebase-products"

interface CategoryData {
  name: string
  description: string
  image: string
  count: string
  href: string
  category: string
}

const defaultCategories: CategoryData[] = [
  {
    name: "Conjuntos",
    description: "Combinações perfeitas",
    image: "/vibrant-bikini-set.png",
    count: "0 peças",
    href: "/categoria/conjuntos",
    category: "conjuntos",
  },
  {
    name: "Tops",
    description: "Para montar seu look",
    image: "/colorful-bikini-top.png",
    count: "0 peças",
    href: "/categoria/tops",
    category: "tops",
  },
  {
    name: "Calcinhas",
    description: "Modelos exclusivos",
    image: "/bikini-bottom.jpg",
    count: "0 peças",
    href: "/categoria/calcinhas",
    category: "calcinhas",
  },
]

export function CategoriesSection() {
  const [categories, setCategories] = useState<CategoryData[]>(defaultCategories)

  useEffect(() => {
    const unsub = subscribeToProducts((products) => {
      const activeProducts = products.filter((p) => p.active)

      const conjuntos = activeProducts.filter((p) => p.category === "conjuntos")
      const tops = activeProducts.filter((p) => p.category === "tops")
      const calcinhas = activeProducts.filter((p) => p.category === "calcinhas")

      setCategories([
        {
          name: "Conjuntos",
          description: "Combinações perfeitas",
          image: conjuntos[0]?.images[0] || "/vibrant-bikini-set.png",
          count: `${conjuntos.length} ${conjuntos.length === 1 ? "peça" : "peças"}`,
          href: "/categoria/conjuntos",
          category: "conjuntos",
        },
        {
          name: "Tops",
          description: "Para montar seu look",
          image: tops[0]?.images[0] || "/colorful-bikini-top.png",
          count: `${tops.length} ${tops.length === 1 ? "peça" : "peças"}`,
          href: "/categoria/tops",
          category: "tops",
        },
        {
          name: "Calcinhas",
          description: "Modelos exclusivos",
          image: calcinhas[0]?.images[0] || "/bikini-bottom.jpg",
          count: `${calcinhas.length} ${calcinhas.length === 1 ? "peça" : "peças"}`,
          href: "/categoria/calcinhas",
          category: "calcinhas",
        },
      ])
    })
    return unsub
  }, [])

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-primary text-sm uppercase tracking-[0.3em]">Explore</span>
          <h3 className="text-4xl md:text-5xl font-bold text-foreground">Nossas Categorias</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Cada peça foi escolhida a dedo para te fazer brilhar neste verão
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden rounded-3xl bg-card"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-primary-foreground">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-sm opacity-80">{category.count}</span>
                    <h4 className="text-2xl font-bold mt-1">{category.name}</h4>
                    <p className="text-sm opacity-80 mt-1">{category.description}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary transition-colors">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Hover decoration */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">Explorar</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
