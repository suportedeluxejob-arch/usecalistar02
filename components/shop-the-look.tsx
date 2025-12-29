"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ShoppingBag, Plus, Upload, Check, RotateCcw, Camera, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  subscribeToShopTheLookConfig,
  subscribeToProductHotspots,
  type ShopTheLookConfig,
  type ProductHotspot,
} from "@/lib/firebase-store-config"
import { subscribeToProducts, type Product } from "@/lib/firebase-products"

export function ShopTheLook() {
  // Estados principais
  const [activeHotspot, setActiveHotspot] = useState<ProductHotspot | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedTop, setSelectedTop] = useState<Product | null>(null)
  const [selectedBottom, setSelectedBottom] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>("M")

  const [shopConfig, setShopConfig] = useState<ShopTheLookConfig>({ featuredProducts: [], enabled: true })
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedFeaturedIndex, setSelectedFeaturedIndex] = useState(0)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [currentProductHotspots, setCurrentProductHotspots] = useState<ProductHotspot[]>([])

  const [allFeaturedHotspots, setAllFeaturedHotspots] = useState<{ [productId: string]: ProductHotspot[] }>({})

  const [displayedProduct, setDisplayedProduct] = useState<Product | null>(null)

  // Estados do Provador Virtual
  const [showVirtualTryOn, setShowVirtualTryOn] = useState(false)
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null)
  const [step, setStep] = useState<1 | 2>(1)

  const [isGenerating, setIsGenerating] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [processingProgress, setProcessingProgress] = useState(0)

  const [productsToAdd, setProductsToAdd] = useState<Product[]>([])
  const [selectedConjunto, setSelectedConjunto] = useState<Product | null>(null)
  const [tryOnMode, setTryOnMode] = useState<"pieces" | "conjunto">("pieces")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addItem } = useCart()

  // Carregar configurações do Firebase
  useEffect(() => {
    const unsubConfig = subscribeToShopTheLookConfig((data) => {
      setShopConfig(data)
    })

    const unsubProducts = subscribeToProducts((data) => {
      setProducts(data.filter((p) => p.active))
      setLoading(false)
    })

    return () => {
      unsubConfig()
      unsubProducts()
    }
  }, [])

  const featuredProductIds = shopConfig.featuredProducts.map((f) => f.productId)
  const featuredProducts = featuredProductIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined)

  const currentFeaturedProduct = featuredProducts[selectedFeaturedIndex] || null

  useEffect(() => {
    if (featuredProducts.length === 0) return

    const unsubscribers: (() => void)[] = []

    featuredProducts.forEach((product) => {
      const unsub = subscribeToProductHotspots(product.id, (hotspots) => {
        setAllFeaturedHotspots((prev) => ({
          ...prev,
          [product.id]: hotspots,
        }))
      })
      unsubscribers.push(unsub)
    })

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [featuredProducts.map((p) => p.id).join(",")])

  useEffect(() => {
    if (products.length === 0) return

    const unsubscribers: (() => void)[] = []

    products.forEach((product) => {
      const unsub = subscribeToProductHotspots(product.id, (hotspots) => {
        setAllFeaturedHotspots((prev) => ({
          ...prev,
          [product.id]: hotspots,
        }))
      })
      unsubscribers.push(unsub)
    })

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [products.map((p) => p.id).join(",")])

  useEffect(() => {
    if (currentFeaturedProduct) {
      setDisplayedProduct(currentFeaturedProduct)
    }
  }, [currentFeaturedProduct])

  useEffect(() => {
    if (displayedProduct && allFeaturedHotspots[displayedProduct.id]) {
      setCurrentProductHotspots(allFeaturedHotspots[displayedProduct.id])
    } else {
      setCurrentProductHotspots([])
    }
  }, [displayedProduct, allFeaturedHotspots])

  // Filtrar produtos por categoria
  const tops = products.filter((p) => p.category === "tops")
  const calcinhas = products.filter((p) => p.category === "calcinhas")
  const conjuntos = products.filter((p) => p.category === "conjuntos")

  const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.id === id)
  }

  const hotspotsForCurrentImage = currentProductHotspots.filter((h) => h.imageIndex === selectedImageIndex)

  const customLookPrice = (selectedTop?.price || 0) + (selectedBottom?.price || 0)

  const handleAddToCart = (product: Product, size?: string) => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0] || "",
        category: product.category,
      },
      1,
      size || selectedSize,
    )
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUserPhoto(reader.result as string)
        setResultImage(null)
        setErrorMessage(null)
        setStep(2)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStartTryOnConjunto = (conjunto: Product) => {
    setTryOnMode("conjunto")
    setTryOnProduct(conjunto)
    setProductsToAdd([conjunto])
    setSelectedConjunto(conjunto)
    setResultImage(null)
    setErrorMessage(null)
    setStep(userPhoto ? 2 : 1)
    setShowVirtualTryOn(true)
  }

  const handleStartTryOnLook = () => {
    const productsForTryOn: Product[] = []
    if (selectedTop) productsForTryOn.push(selectedTop)
    if (selectedBottom) productsForTryOn.push(selectedBottom)

    if (productsForTryOn.length === 0) return

    setTryOnMode("pieces")
    setTryOnProduct(productsForTryOn[0])
    setProductsToAdd(productsForTryOn)
    setSelectedConjunto(null)
    setResultImage(null)
    setErrorMessage(null)
    setStep(userPhoto ? 2 : 1)
    setShowVirtualTryOn(true)
  }

  const handleStartTryOn = (product: Product) => {
    if (product.category === "conjuntos") {
      handleStartTryOnConjunto(product)
      return
    }
    setTryOnMode("pieces")
    setTryOnProduct(product)
    setProductsToAdd([product])
    setSelectedConjunto(null)
    setResultImage(null)
    setErrorMessage(null)
    setStep(userPhoto ? 2 : 1)
    setShowVirtualTryOn(true)
  }

  const handleAddAllToCart = () => {
    productsToAdd.forEach((product) => {
      handleAddToCart(product)
    })
    setShowVirtualTryOn(false)
    resetTryOn()
  }

  const generateVirtualTryOn = async () => {
    if (!userPhoto) return

    setIsGenerating(true)
    setErrorMessage(null)
    setResultImage(null)
    setProcessingProgress(0)

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 8
      })
    }, 1500)

    try {
      let finalResultUrl = userPhoto

      if (tryOnMode === "conjunto" && selectedConjunto) {
        // Conjunto completo - uma única chamada com full_set
        console.log("[v0] Processando conjunto completo:", selectedConjunto.name)

        const response = await fetch("/api/virtual-try-on", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userPhotoBase64: userPhoto,
            productImageUrl: selectedConjunto.images[0],
            productCategory: "conjuntos",
          }),
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Erro ao processar")

        finalResultUrl = data.resultImageUrl
      } else if (tryOnMode === "pieces") {
        // Peças separadas - processar sequencialmente
        let currentPhoto = userPhoto

        // Primeiro processa o top (parte superior)
        if (selectedTop) {
          console.log("[v0] Processando top:", selectedTop.name)
          setProcessingProgress(20)

          const topResponse = await fetch("/api/virtual-try-on", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userPhotoBase64: currentPhoto,
              productImageUrl: selectedTop.images[0],
              productCategory: "tops",
            }),
          })

          const topData = await topResponse.json()
          if (!topResponse.ok) throw new Error(topData.error || "Erro ao processar top")

          // Converte a URL do resultado para base64 para usar na próxima chamada
          if (selectedBottom) {
            const resultResponse = await fetch(topData.resultImageUrl)
            const resultBlob = await resultResponse.blob()
            currentPhoto = await new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.readAsDataURL(resultBlob)
            })
          } else {
            finalResultUrl = topData.resultImageUrl
          }
        }

        // Depois processa a calcinha (parte inferior)
        if (selectedBottom) {
          console.log("[v0] Processando calcinha:", selectedBottom.name)
          setProcessingProgress(60)

          const bottomResponse = await fetch("/api/virtual-try-on", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userPhotoBase64: currentPhoto,
              productImageUrl: selectedBottom.images[0],
              productCategory: "calcinhas",
            }),
          })

          const bottomData = await bottomResponse.json()
          if (!bottomResponse.ok) throw new Error(bottomData.error || "Erro ao processar calcinha")

          finalResultUrl = bottomData.resultImageUrl
        }

        // Se só tem um produto avulso
        if (!selectedTop && !selectedBottom && tryOnProduct) {
          console.log("[v0] Processando peça avulsa:", tryOnProduct.name)

          const response = await fetch("/api/virtual-try-on", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userPhotoBase64: currentPhoto,
              productImageUrl: tryOnProduct.images[0],
              productCategory: tryOnProduct.category,
            }),
          })

          const data = await response.json()
          if (!response.ok) throw new Error(data.error || "Erro ao processar")

          finalResultUrl = data.resultImageUrl
        }
      }

      setProcessingProgress(100)
      setResultImage(finalResultUrl)
      setStep(2)
    } catch (error) {
      console.error("[v0] Erro no provador virtual:", error)
      setErrorMessage(error instanceof Error ? error.message : "Erro ao processar imagem. Tente novamente.")
    } finally {
      clearInterval(progressInterval)
      setIsGenerating(false)
    }
  }

  const resetTryOn = () => {
    setUserPhoto(null)
    setResultImage(null)
    setStep(1)
    setErrorMessage(null)
    setProcessingProgress(0)
  }

  const handleProductClick = (product: Product) => {
    setDisplayedProduct(product)
    setSelectedImageIndex(0)
    setActiveHotspot(null)
  }

  const handleHotspotClick = (hotspot: ProductHotspot) => {
    const product = getProductById(hotspot.productId)

    if (product) {
      setDisplayedProduct(product)
      setSelectedImageIndex(0)
      setActiveHotspot(null)
    } else {
      if (activeHotspot?.id === hotspot.id) {
        setActiveHotspot(null)
      } else {
        setActiveHotspot(hotspot)
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  if (!shopConfig.enabled || featuredProducts.length === 0) {
    return null
  }

  const currentImage = displayedProduct?.images[selectedImageIndex] || ""
  const totalImages = displayedProduct?.images.length || 0

  return (
    <section id="shop-the-look" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Inspire-se
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Shop the Look</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore nossos looks favoritos! Toque nos marcadores para descobrir cada peça.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Imagem Principal com Hotspots */}
          <div className="relative">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary shadow-xl">
              <img
                src={currentImage || "/placeholder.svg"}
                alt={displayedProduct?.name || "Shop the Look"}
                className="w-full h-full object-cover object-top"
              />

              {/* Hotspots */}
              {hotspotsForCurrentImage.map((hotspot) => {
                const product = getProductById(hotspot.productId)
                const isActive = activeHotspot?.id === hotspot.id
                const isHovered = hoveredId === hotspot.id

                return (
                  <div
                    key={hotspot.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ left: `${hotspot.position.x}%`, top: `${hotspot.position.y}%` }}
                  >
                    <button
                      onClick={() => handleHotspotClick(hotspot)}
                      onMouseEnter={() => setHoveredId(hotspot.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="relative"
                    >
                      <span className="absolute inset-0 w-10 h-10 -m-1 rounded-full bg-primary/30 animate-ping" />
                      <span
                        className={`relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-white text-foreground hover:bg-primary hover:text-primary-foreground"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </span>
                    </button>

                    {(isHovered || isActive) && product && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-card rounded-xl shadow-xl p-3 min-w-[200px] z-20 border border-border">
                        <div className="flex gap-3">
                          <img
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-14 h-18 rounded-lg object-cover"
                          />
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <p className="font-medium text-foreground text-sm leading-tight">
                                {hotspot.label || product.name}
                              </p>
                              <p className="text-primary font-bold text-sm mt-1">
                                R$ {product.price.toLocaleString("pt-BR")}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              className="w-full text-xs h-7 mt-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddToCart(product)
                              }}
                            >
                              <ShoppingBag className="w-3 h-3 mr-1" />
                              Comprar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Indicadores de imagem */}
              {totalImages > 1 && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
                  {displayedProduct?.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        selectedImageIndex === idx ? "bg-primary" : "bg-white/50 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Botão Experimentar */}
              <div className="absolute bottom-4 left-4">
                <Button
                  onClick={() => displayedProduct && handleStartTryOn(displayedProduct)}
                  className="rounded-full shadow-lg"
                  disabled={!displayedProduct}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Experimentar
                </Button>
              </div>

              {displayedProduct && (
                <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border">
                  <p className="font-medium text-foreground text-sm">{displayedProduct.name}</p>
                  <p className="text-primary font-bold">R$ {displayedProduct.price.toLocaleString("pt-BR")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Painel Lateral - Monte seu Look */}
          <div className="bg-card rounded-2xl p-6 shadow-lg">
            <Tabs defaultValue="monte" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="monte">Monte Seu Look</TabsTrigger>
                <TabsTrigger value="conjuntos">Conjuntos</TabsTrigger>
              </TabsList>

              <TabsContent value="monte" className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Misture e combine! Escolha suas peças favoritas e crie um look único.
                </p>

                {/* Seleção de Top */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">1. Escolha o Top</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {tops.slice(0, 4).map((top) => (
                      <button
                        key={top.id}
                        onClick={() => {
                          setSelectedTop(selectedTop?.id === top.id ? null : top)
                          handleProductClick(top)
                        }}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                          selectedTop?.id === top.id
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-transparent hover:border-primary/50"
                        }`}
                      >
                        <div className="aspect-square">
                          <img
                            src={top.images[0] || "/placeholder.svg"}
                            alt={top.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-white text-xs font-medium truncate">{top.name}</p>
                          <p className="text-white/80 text-xs">R$ {top.price.toLocaleString("pt-BR")}</p>
                        </div>
                        {selectedTop?.id === top.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seleção de Calcinha */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">2. Escolha a Calcinha</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {calcinhas.slice(0, 4).map((bottom) => (
                      <button
                        key={bottom.id}
                        onClick={() => {
                          setSelectedBottom(selectedBottom?.id === bottom.id ? null : bottom)
                          handleProductClick(bottom)
                        }}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                          selectedBottom?.id === bottom.id
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-transparent hover:border-primary/50"
                        }`}
                      >
                        <div className="aspect-square">
                          <img
                            src={bottom.images[0] || "/placeholder.svg"}
                            alt={bottom.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-white text-xs font-medium truncate">{bottom.name}</p>
                          <p className="text-white/80 text-xs">R$ {bottom.price.toLocaleString("pt-BR")}</p>
                        </div>
                        {selectedBottom?.id === bottom.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resumo */}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground">Seu Look</span>
                    <span className="text-sm text-muted-foreground">
                      {selectedTop ? selectedTop.name.split(" ")[0] : "—"} +{" "}
                      {selectedBottom ? selectedBottom.name.split(" ")[0] : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-primary text-lg">R$ {customLookPrice.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={handleStartTryOnLook} disabled={!selectedTop && !selectedBottom}>
                      <Camera className="w-4 h-4 mr-2" />
                      Experimentar
                    </Button>
                    <Button
                      onClick={() => {
                        if (selectedTop) handleAddToCart(selectedTop)
                        if (selectedBottom) handleAddToCart(selectedBottom)
                      }}
                      disabled={!selectedTop && !selectedBottom}
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="conjuntos" className="space-y-4">
                <p className="text-sm text-muted-foreground">Combinações perfeitas, prontas para você arrasar!</p>
                <div className="grid grid-cols-2 gap-3">
                  {conjuntos.slice(0, 4).map((conjunto) => (
                    <button
                      key={conjunto.id}
                      onClick={() => {
                        setSelectedConjunto(selectedConjunto?.id === conjunto.id ? null : conjunto)
                        handleProductClick(conjunto)
                      }}
                      className={`relative rounded-xl overflow-hidden group border-2 transition-all ${
                        selectedConjunto?.id === conjunto.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-primary/50"
                      }`}
                    >
                      <div className="aspect-square">
                        <img
                          src={conjunto.images[0] || "/placeholder.svg"}
                          alt={conjunto.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white text-sm font-medium truncate">{conjunto.name}</p>
                        <p className="text-white/80 text-sm">R$ {conjunto.price.toLocaleString("pt-BR")}</p>
                      </div>
                      {selectedConjunto?.id === conjunto.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {selectedConjunto && (
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">Conjunto selecionado</span>
                      <span className="text-sm font-medium text-foreground">{selectedConjunto.name}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-bold text-primary text-lg">
                        R$ {selectedConjunto.price.toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" onClick={() => handleStartTryOnConjunto(selectedConjunto)}>
                        <Camera className="w-4 h-4 mr-2" />
                        Experimentar
                      </Button>
                      <Button onClick={() => handleAddToCart(selectedConjunto)}>Adicionar</Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modal do Provador Virtual */}
      <Dialog open={showVirtualTryOn} onOpenChange={setShowVirtualTryOn}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Provador Virtual
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              {tryOnMode === "conjunto" && selectedConjunto ? (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Conjunto Completo</p>
                  <p className="font-medium text-foreground">{selectedConjunto.name}</p>
                  <p className="text-primary font-semibold">R$ {selectedConjunto.price.toFixed(2).replace(".", ",")}</p>
                </div>
              ) : productsToAdd.length > 1 ? (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Peças Separadas</p>
                  <p className="font-medium text-foreground">{productsToAdd.map((p) => p.name).join(" + ")}</p>
                  <p className="text-primary font-semibold">
                    R${" "}
                    {productsToAdd
                      .reduce((sum, p) => sum + p.price, 0)
                      .toFixed(2)
                      .replace(".", ",")}
                  </p>
                </div>
              ) : tryOnProduct ? (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Peça Avulsa</p>
                  <p className="font-medium text-foreground">{tryOnProduct.name}</p>
                  <p className="text-primary font-semibold">R$ {tryOnProduct.price.toFixed(2).replace(".", ",")}</p>
                </div>
              ) : null}
            </div>

            {step === 1 && !isGenerating && (
              <div className="space-y-4">
                {!userPhoto ? (
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary/50 transition-colors text-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">Envie uma foto sua para experimentar</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Clique para selecionar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary mx-auto max-w-xs">
                      <img
                        src={userPhoto || "/placeholder.svg"}
                        alt="Sua foto"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex justify-center gap-3">
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Trocar foto
                      </Button>
                      <Button size="sm" onClick={generateVirtualTryOn}>
                        Gerar Resultado
                      </Button>
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>
            )}

            {isGenerating && (
              <div className="text-center space-y-4 py-8">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
                <div className="space-y-2">
                  <p className="text-muted-foreground">Processando com IA...</p>
                  <p className="text-xs text-muted-foreground/70">
                    {tryOnMode === "pieces" && selectedTop && selectedBottom
                      ? "Aplicando top e calcinha na sua foto"
                      : "Aplicando a peça na sua foto"}
                  </p>
                </div>
                <Progress value={processingProgress} className="max-w-xs mx-auto" />
              </div>
            )}

            {step === 2 && resultImage && !isGenerating && (
              <div className="space-y-4">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary mx-auto max-w-xs">
                  <img src={resultImage || "/placeholder.svg"} alt="Resultado" className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={resetTryOn}>
                    Tentar outra foto
                  </Button>
                  <Button size="sm" onClick={handleAddAllToCart}>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-center text-sm">
                {errorMessage}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
