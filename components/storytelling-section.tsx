"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Heart, Package, Star, TrendingUp, Users, Sparkles, Loader2 } from "lucide-react"
import { subscribeToStorytellingConfig, type StorytellingConfig } from "@/lib/firebase-store-config"

const iconMap = {
  heart: Heart,
  package: Package,
  star: Star,
  sparkles: Sparkles,
  users: Users,
  trendingup: TrendingUp,
}

const timelineIconMap: Record<number, typeof Package> = {
  0: Package,
  1: Users,
  2: TrendingUp,
  3: Star,
}

export function StorytellingSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [config, setConfig] = useState<StorytellingConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeToStorytellingConfig((data) => {
      setConfig(data)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-[#FDF8F6]">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#C9A87C]" />
        </div>
      </section>
    )
  }

  if (!config || !config.enabled) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-[#FDF8F6]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm uppercase tracking-[0.2em] text-[#C9A87C] font-medium">Nossa História</span>
          <h2 className="text-3xl md:text-5xl font-serif text-[#2D2D2D] mt-4 mb-6 text-balance">Conheça a Isa</h2>
          <p className="text-[#6B6B6B] max-w-2xl mx-auto text-lg leading-relaxed">{config.sectionSubtitle}</p>
        </div>

        {/* Quote Section */}
        <div className="max-w-3xl mx-auto mb-20 text-center">
          <div className="relative">
            <span className="text-8xl text-[#E8D4C4] font-serif absolute -top-8 left-0">"</span>
            <blockquote className="text-xl md:text-2xl text-[#3D3D3D] font-light italic leading-relaxed px-8">
              {config.quote}
            </blockquote>
            <span className="text-8xl text-[#E8D4C4] font-serif absolute -bottom-16 right-0">"</span>
          </div>
          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C9A87C]">
              <Image
                src={config.founderImage || "/placeholder.svg"}
                alt={config.founderName}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="text-left">
              <p className="font-medium text-[#2D2D2D]">{config.founderName}</p>
              <p className="text-sm text-[#6B6B6B]">{config.founderTitle}</p>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        {config.timelineItems.length > 0 && (
          <div className="mb-20">
            <h3 className="text-2xl md:text-3xl font-serif text-[#2D2D2D] text-center mb-12">{config.timelineTitle}</h3>

            {/* Timeline Navigation */}
            <div className="flex justify-center gap-4 md:gap-8 mb-12">
              {config.timelineItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(index)}
                  className={`relative px-4 py-2 transition-all duration-300 ${
                    activeIndex === index ? "text-[#C9A87C]" : "text-[#9B9B9B] hover:text-[#6B6B6B]"
                  }`}
                >
                  <span className="text-lg md:text-xl font-semibold">{item.year}</span>
                  {activeIndex === index && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#C9A87C]" />
                  )}
                </button>
              ))}
            </div>

            {/* Timeline Content */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center max-w-5xl mx-auto">
              {/* Image */}
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={config.timelineItems[activeIndex]?.image || "/placeholder.svg"}
                    alt={config.timelineItems[activeIndex]?.title || ""}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full transition-all duration-500"
                  />
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-4 -right-4 md:bottom-8 md:-right-8 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                  {(() => {
                    const IconComponent = timelineIconMap[activeIndex] || Star
                    return <IconComponent className="w-5 h-5 text-[#C9A87C]" />
                  })()}
                  <span className="text-sm font-medium text-[#2D2D2D]">
                    {config.timelineItems[activeIndex]?.highlight}
                  </span>
                </div>
                {/* Decorative Element */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#E8D4C4]/30 rounded-full -z-10" />
              </div>

              {/* Content */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#C9A87C]/10 px-4 py-2 rounded-full">
                  <span className="text-[#C9A87C] font-semibold">{config.timelineItems[activeIndex]?.year}</span>
                </div>
                <h4 className="text-2xl md:text-3xl font-serif text-[#2D2D2D]">
                  {config.timelineItems[activeIndex]?.title}
                </h4>
                <p className="text-[#6B6B6B] text-lg leading-relaxed">
                  {config.timelineItems[activeIndex]?.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        {config.stats.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {config.stats.map((stat, index) => {
                const IconComponent = iconMap[stat.icon] || Heart
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FDF8F6] mb-4">
                      <IconComponent className="w-6 h-6 text-[#C9A87C]" />
                    </div>
                    <p className="text-3xl md:text-4xl font-serif text-[#2D2D2D] mb-2">{stat.number}</p>
                    <p className="text-sm text-[#6B6B6B]">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Values Section */}
        {config.values.length > 0 && (
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            {config.values.map((value) => {
              const IconComponent = iconMap[value.icon] || Heart
              return (
                <div key={value.id} className="text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-[#E8D4C4]/30 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-[#C9A87C]" />
                  </div>
                  <h4 className="text-xl font-serif text-[#2D2D2D] mb-3">{value.title}</h4>
                  <p className="text-[#6B6B6B] leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
