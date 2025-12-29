"use client"

import { useState } from "react"
import { X, Minus, Plus, Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/products"

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, quantity: number, size?: string, color?: string) => void
}

export function QuickViewModal({ product, isOpen, onClose, onAddToCart }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | undefined>()
  const [selectedColor, setSelectedColor] = useState<string | undefined>()

  if (!isOpen || !product) return null

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedSize, selectedColor)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square md:aspect-auto bg-secondary">
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] md:max-h-none">
            <div>
              <span className="text-primary text-sm uppercase tracking-wide">
                {product.category === "bikinis" ? "Biquíni" : product.category === "vestidos" ? "Vestido" : "Acessório"}
              </span>
              <h3 className="text-2xl font-bold text-foreground mt-1">{product.name}</h3>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-foreground">R$ {product.price.toLocaleString("pt-BR")}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  R$ {product.originalPrice.toLocaleString("pt-BR")}
                </span>
              )}
              {product.isSale && (
                <span className="bg-accent text-accent-foreground text-sm px-3 py-1 rounded-full">
                  -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Colors */}
            {product.colors && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">Cor</span>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color.name ? "border-primary scale-110" : "border-border"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">Tamanho</span>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-xl border-2 text-sm font-medium transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary text-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-foreground">Quantidade</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-secondary rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:text-primary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:text-primary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button size="lg" className="flex-1 rounded-full" onClick={handleAddToCart}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-4 bg-transparent">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Info */}
            <div className="text-sm text-muted-foreground space-y-1 pt-4 border-t border-border">
              <p>Frete grátis acima de R$299</p>
              <p>Troca grátis em até 30 dias</p>
              <p>Parcele em até 10x sem juros</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
