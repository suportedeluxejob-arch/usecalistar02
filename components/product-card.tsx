"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, ShoppingBag, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/products"

interface ProductCardProps {
  product: Product
  onQuickView: (product: Product) => void
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onQuickView, onAddToCart }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="group relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Link href={`/produto/${product.id}`}>
        {/* Image Container */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary mb-4">
          <img
            src={isHovered && product.hoverImage ? product.hoverImage : product.image}
            alt={product.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                Novo
              </span>
            )}
            {product.isSale && (
              <span className="bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full font-medium">
                -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Favorite Button - outside Link to prevent navigation */}
      <button
        onClick={(e) => {
          e.preventDefault()
          setIsFavorite(!isFavorite)
        }}
        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 ${
          isFavorite
            ? "bg-primary text-primary-foreground"
            : "bg-card/80 backdrop-blur-sm text-foreground hover:bg-card"
        }`}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
      </button>

      {/* Hover Actions - outside Link */}
      <div
        className={`absolute inset-x-3 bottom-[calc(25%+1rem)] flex gap-2 transition-all duration-300 z-10 ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Button
          size="sm"
          className="flex-1 rounded-full"
          onClick={(e) => {
            e.preventDefault()
            onAddToCart(product)
          }}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full px-3 bg-card/80 backdrop-blur-sm border-0 hover:bg-card"
          onClick={(e) => {
            e.preventDefault()
            onQuickView(product)
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>

      {/* Product Info */}
      <Link href={`/produto/${product.id}`}>
        <div className="space-y-2">
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{product.name}</h4>

          {/* Colors */}
          {product.colors && (
            <div className="flex gap-1">
              {product.colors.map((color) => (
                <span
                  key={color.name}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">R$ {product.price.toLocaleString("pt-BR")}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {product.originalPrice.toLocaleString("pt-BR")}
              </span>
            )}
          </div>

          {/* Sizes Preview */}
          {product.sizes && (
            <div className="flex gap-1 text-xs text-muted-foreground">
              {product.sizes.map((size) => (
                <span key={size} className="px-2 py-0.5 bg-secondary rounded">
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
