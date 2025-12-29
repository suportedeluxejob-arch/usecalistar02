"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { subscribeToBackstageConfig, type BackstageConfig } from "@/lib/firebase-store-config"
import { ImageIcon } from "lucide-react"

export function BackstageGallery() {
  const [config, setConfig] = useState<BackstageConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeToBackstageConfig((data) => {
      setConfig(data)
      setLoading(false)
    })
    return unsub
  }, [])

  // Don't render if disabled or loading
  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-12" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-gray-200 rounded-xl ${i === 0 || i === 7 ? "col-span-2 row-span-2" : ""}`}
                  style={{ aspectRatio: "1/1" }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!config || !config.enabled) {
    return null
  }

  // Filter images that have actual URLs
  const imagesWithContent = config.images.filter((img) => img.image)

  if (imagesWithContent.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-[#2D2D2D] mb-4">{config.title}</h2>
          <p className="text-[#6B6B6B] max-w-xl mx-auto">{config.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {config.images
            .sort((a, b) => a.order - b.order)
            .map((img) => (
              <div
                key={img.id}
                className={`relative overflow-hidden rounded-xl group ${
                  img.size === "large" ? "col-span-2 row-span-2" : ""
                }`}
              >
                {img.image ? (
                  <>
                    <Image
                      src={img.image || "/placeholder.svg"}
                      alt={img.caption || "Bastidores"}
                      width={img.size === "large" ? 600 : 300}
                      height={img.size === "large" ? 600 : 300}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                    />
                    {img.caption && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                        <p className="text-white text-sm p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {img.caption}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full min-h-[150px] bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}
