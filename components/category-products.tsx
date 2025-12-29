"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { QuickViewModal } from "@/components/quick-view-modal"
import { subscribeToProducts, type Product as FirebaseProduct } from "@/lib/firebase-products"
import type { Product } from "@/lib/products"
import { useCart } from "@/contexts/cart-context"
import { SlidersHorizontal, Grid3X3, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"

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

interface CategoryProductsProps {
  categorySlug: string
  categoryTitle: string
}

type SortOption = "recent" | "price-asc" | "price-desc" | "name"

export function CategoryProducts({ categorySlug, categoryTitle }: CategoryProductsProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>("recent")
  const [gridCols, setGridCols] = useState<3 | 4>(4)
  const { addItem } = useCart()

  useEffect(() => {
    const unsub = subscribeToProducts((firebaseProducts) => {
      const activeProducts = firebaseProducts
        .filter((p) => p.active && p.category === categorySlug)
        .map(convertFirebaseProduct)
      setProducts(activeProducts)
      setLoading(false)
    })
    return unsub
  }, [categorySlug])

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price
      case "price-desc":
        return b.price - a.price
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const handleAddToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    addItem(product, quantity, size, color)
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
          <p className="text-muted-foreground">
            {products.length} {products.length === 1 ? "produto" : "produtos"} em {categoryTitle}
          </p>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-sm border-0 focus:ring-0 cursor-pointer text-foreground"
              >
                <option value="recent">Mais recentes</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="name">Nome A-Z</option>
              </select>
            </div>

            {/* Grid Toggle */}
            <div className="hidden md:flex items-center gap-1 border-l border-border pl-4">
              <Button
                variant="ghost"
                size="icon"
                className={gridCols === 3 ? "text-primary" : "text-muted-foreground"}
                onClick={() => setGridCols(3)}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={gridCols === 4 ? "text-primary" : "text-muted-foreground"}
                onClick={() => setGridCols(4)}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Nenhum produto encontrado nesta categoria.</p>
            <p className="text-muted-foreground mt-2">Em breve teremos novidades!</p>
          </div>
        ) : (
          /* Products Grid */
          <div
            className={`grid grid-cols-2 gap-6 md:gap-8 ${gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4"}`}
          >
            {sortedProducts.map((product) => (
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
