"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { QuickViewModal } from "@/components/quick-view-modal"
import { subscribeToProducts, type Product as FirebaseProduct } from "@/lib/firebase-products"
import type { Product } from "@/lib/products"
import { useCart } from "@/contexts/cart-context"

const categories = [
  { id: "all", name: "Todos" },
  { id: "conjuntos", name: "Conjuntos" },
  { id: "tops", name: "Tops" },
  { id: "calcinhas", name: "Calcinhas" },
]

function convertFirebaseProduct(fp: FirebaseProduct): Product {
  return {
    id: fp.id,
    name: fp.name,
    description: fp.description,
    price: fp.price,
    originalPrice: fp.originalPrice,
    image: fp.images[0] || "/placeholder.svg",
    images: fp.images,
    category: fp.category,
    sizes: fp.sizes,
    colors: fp.colors.map((c) => ({ name: c, hex: getColorHex(c) })),
    isNew: fp.featured,
    isSale: (fp.discount || 0) > 0,
    rating: fp.rating,
    reviews: fp.reviews,
    details: [],
    material: "Poliamida com elastano",
    careInstructions: ["Lavar à mão", "Não usar alvejante", "Secar à sombra"],
  }
}

function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    Preto: "#000000",
    Branco: "#FFFFFF",
    Rosa: "#FF69B4",
    Azul: "#87CEEB",
    Verde: "#90EE90",
    Vermelho: "#FF6B6B",
    Nude: "#E8C4A8",
    "Animal Print": "#D4A574",
  }
  return colorMap[colorName] || "#CCCCCC"
}

export function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const unsub = subscribeToProducts((firebaseProducts) => {
      const activeProducts = firebaseProducts.filter((p) => p.active)
      setProducts(activeProducts.map(convertFirebaseProduct))
      setLoading(false)
    })
    return unsub
  }, [])

  const filteredProducts = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory)

  const handleAddToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    addItem(product, quantity, size, color)
  }

  return (
    <section id="novidades" className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-primary text-sm uppercase tracking-[0.3em]">Coleção</span>
          <h3 className="text-4xl md:text-5xl font-bold text-foreground">Nossos Produtos</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Peças cuidadosamente selecionadas para o seu verão perfeito
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* Quick View Modal */}
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />
      </div>
    </section>
  )
}
