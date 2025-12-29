"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  CreditCard,
  Star,
  Clock,
  Check,
  Ruler,
  Package,
  Sparkles,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/lib/products"
import { subscribeToRecommendationSections, type RecommendationSection } from "@/lib/firebase-store-config"
import { subscribeToProducts, type Product as FirebaseProduct } from "@/lib/firebase-products"

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | undefined>()
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors?.[0]?.name)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const { addItem } = useCart()

  const [recommendationSections, setRecommendationSections] = useState<RecommendationSection[]>([])
  const [allProducts, setAllProducts] = useState<FirebaseProduct[]>([])
  const [loadingSections, setLoadingSections] = useState(true)

  // Carrega seções de recomendação e produtos do Firebase
  useEffect(() => {
    const unsubSections = subscribeToRecommendationSections((sections) => {
      // Filtra apenas seções ativas e que devem aparecer nesta categoria
      const filteredSections = sections.filter((s) => s.enabled && s.showOnCategories.includes(product.category))
      setRecommendationSections(filteredSections)
    })

    const unsubProducts = subscribeToProducts((products) => {
      setAllProducts(products.filter((p) => p.active))
      setLoadingSections(false)
    })

    return () => {
      unsubSections()
      unsubProducts()
    }
  }, [product.category])

  // Função para obter produtos de uma seção
  const getSectionProducts = (section: RecommendationSection): Product[] => {
    if (section.productIds && section.productIds.length > 0) {
      // Usa produtos específicos configurados
      return section.productIds
        .map((id) => {
          const fp = allProducts.find((p) => p.id === id)
          if (!fp) return null
          return {
            id: fp.id,
            name: fp.name,
            price: fp.price,
            originalPrice: fp.originalPrice,
            image: fp.images[0] || "",
            images: fp.images,
            category: fp.category,
            description: fp.description,
            sizes: fp.sizes,
            isNew: fp.featured,
            isSale: !!fp.discount,
          } as Product
        })
        .filter((p): p is Product => p !== null && p.id !== product.id)
        .slice(0, 4)
    }

    // Se não tem produtos específicos, usa produtos relacionados da mesma categoria
    return relatedProducts.slice(0, 4)
  }

  const images = product.images || [product.image]

  // Simulated stock and urgency
  const stockCount = Math.floor(Math.random() * 10) + 3
  const viewersCount = Math.floor(Math.random() * 20) + 5

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Por favor, selecione um tamanho")
      return
    }
    addItem(product, quantity, selectedSize, selectedColor)
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
  }

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Top Benefits Bar */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 text-xs md:text-sm overflow-x-auto">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Truck className="w-4 h-4" />
              <span>Frete Grátis acima de R$299</span>
            </div>
            <div className="hidden md:flex items-center gap-2 whitespace-nowrap">
              <RefreshCw className="w-4 h-4" />
              <span>Troca Grátis em 30 dias</span>
            </div>
            <div className="hidden md:flex items-center gap-2 whitespace-nowrap">
              <CreditCard className="w-4 h-4" />
              <span>10x sem juros</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Início
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/#novidades" className="hover:text-primary transition-colors capitalize">
            {product.category}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary">
              <img
                src={images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover object-top"
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full font-medium">
                    Novo
                  </span>
                )}
                {product.isSale && (
                  <span className="bg-accent text-accent-foreground text-xs px-3 py-1.5 rounded-full font-medium">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Favorite */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isFavorite
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/90 backdrop-blur-sm text-foreground hover:bg-background"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-24 rounded-lg overflow-hidden transition-all ${
                      selectedImage === idx ? "ring-2 ring-primary ring-offset-2" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img || "/placeholder.svg"} alt="" className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Urgency Banner */}
            <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-xl border border-accent/20">
              <div className="flex items-center gap-1 text-accent">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{viewersCount} pessoas estão vendo agora</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-1 text-muted-foreground">
                <Package className="w-4 h-4" />
                <span className="text-sm">Apenas {stockCount} em estoque</span>
              </div>
            </div>

            {/* Title & Rating */}
            <div>
              <span className="text-primary text-sm uppercase tracking-widest font-medium">
                {product.category === "conjuntos"
                  ? "Conjunto de Biquíni"
                  : product.category === "tops"
                    ? "Top de Biquíni"
                    : "Calcinha de Biquíni"}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{product.name}</h1>

              {/* Stars */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(127 avaliações)</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-foreground">R$ {product.price.toLocaleString("pt-BR")}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    R$ {product.originalPrice.toLocaleString("pt-BR")}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                ou{" "}
                <span className="font-medium text-foreground">
                  10x de R$ {(product.price / 10).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>{" "}
                sem juros
              </p>
              <p className="text-sm text-primary font-medium flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Economia de R$ {((product.originalPrice || product.price) - product.price).toLocaleString("pt-BR")}{" "}
                nesta compra
              </p>
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Cor: <span className="text-muted-foreground">{selectedColor}</span>
                  </span>
                </div>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color.name
                          ? "border-primary scale-110 shadow-lg"
                          : "border-border hover:scale-105"
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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Tamanho: <span className="text-muted-foreground">{selectedSize || "Selecione"}</span>
                  </span>
                  <button
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Ruler className="w-4 h-4" />
                    Guia de Tamanhos
                  </button>
                </div>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 rounded-xl border-2 text-sm font-medium transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground shadow-lg"
                          : "border-border hover:border-primary text-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Size Guide */}
                {showSizeGuide && (
                  <div className="p-4 bg-secondary rounded-xl mt-3">
                    <h4 className="font-medium mb-3">Guia de Tamanhos</h4>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="font-medium">Tam</div>
                      <div className="font-medium">Busto</div>
                      <div className="font-medium">Cintura</div>
                      <div className="font-medium">Quadril</div>
                      <div>P</div>
                      <div>82-86</div>
                      <div>62-66</div>
                      <div>88-92</div>
                      <div>M</div>
                      <div>86-90</div>
                      <div>66-70</div>
                      <div>92-96</div>
                      <div>G</div>
                      <div>90-94</div>
                      <div>70-74</div>
                      <div>96-100</div>
                      <div>GG</div>
                      <div>94-98</div>
                      <div>74-78</div>
                      <div>100-104</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Medidas em centímetros</p>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-foreground">Quantidade</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-secondary rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:text-primary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:text-primary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3 pt-2">
              <Button size="lg" className="w-full rounded-full h-14 text-lg font-semibold" onClick={handleAddToCart}>
                Adicionar ao Carrinho - R$ {(product.price * quantity).toLocaleString("pt-BR")}
              </Button>

              {/* Free Shipping Badge */}
              {product.price * quantity >= 299 ? (
                <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-xl">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Parabéns! Você ganhou Frete Grátis</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 p-3 bg-secondary rounded-xl text-muted-foreground">
                  <Truck className="w-5 h-5" />
                  <span>Falta R$ {(299 - product.price * quantity).toLocaleString("pt-BR")} para Frete Grátis</span>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center text-center p-4 bg-secondary rounded-xl">
                <Truck className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs font-medium">Frete Grátis</span>
                <span className="text-xs text-muted-foreground">acima de R$299</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-secondary rounded-xl">
                <RefreshCw className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs font-medium">Troca Grátis</span>
                <span className="text-xs text-muted-foreground">em 30 dias</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-secondary rounded-xl">
                <Shield className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs font-medium">Compra Segura</span>
                <span className="text-xs text-muted-foreground">100% protegida</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 pt-6 border-t border-border">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Descrição</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {product.details && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Detalhes</h3>
                  <ul className="space-y-1">
                    {product.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                        <Check className="w-4 h-4 text-primary" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.material && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Material</h3>
                  <p className="text-muted-foreground">{product.material}</p>
                </div>
              )}

              {product.careInstructions && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Cuidados</h3>
                  <ul className="space-y-1">
                    {product.careInstructions.map((instruction, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        • {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {loadingSections ? (
          <div className="mt-20 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Seções configuradas no Admin */}
            {recommendationSections.map((section) => {
              const sectionProducts = getSectionProducts(section)
              if (sectionProducts.length === 0) return null

              return (
                <div key={section.id} className="mt-20">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                    {section.description && <p className="text-muted-foreground mt-1">{section.description}</p>}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {sectionProducts.map((sectionProduct) => (
                      <Link key={sectionProduct.id} href={`/produto/${sectionProduct.id}`} className="group">
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary mb-3">
                          <img
                            src={sectionProduct.image || "/placeholder.svg"}
                            alt={sectionProduct.name}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                          {sectionProduct.isNew && (
                            <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                              Novo
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {sectionProduct.name}
                        </h4>
                        <p className="text-sm font-bold text-foreground">
                          R$ {sectionProduct.price.toLocaleString("pt-BR")}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Fallback: Produtos Relacionados padrão se não há seções configuradas */}
            {recommendationSections.length === 0 && relatedProducts.length > 0 && (
              <div className="mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-8">Você também pode gostar</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {relatedProducts.map((relatedProduct) => (
                    <Link key={relatedProduct.id} href={`/produto/${relatedProduct.id}`} className="group">
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary mb-3">
                        <img
                          src={relatedProduct.image || "/placeholder.svg"}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                        {relatedProduct.isNew && (
                          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            Novo
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {relatedProduct.name}
                      </h4>
                      <p className="text-sm font-bold text-foreground">
                        R$ {relatedProduct.price.toLocaleString("pt-BR")}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
