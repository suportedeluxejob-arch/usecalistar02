"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Trash2,
  Move,
  ImageIcon,
  Eye,
  Save,
  GripVertical,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Package,
} from "lucide-react"
import { subscribeToProducts, type Product } from "@/lib/firebase-products"
import {
  subscribeToProductHotspots,
  updateProductHotspots,
  subscribeToShopTheLookConfig,
  updateShopTheLookConfig,
  type ProductHotspot,
  type ShopTheLookConfig,
} from "@/lib/firebase-store-config"
import { formatCurrency } from "@/lib/utils"

export function AdminShopTheLook() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [hotspots, setHotspots] = useState<ProductHotspot[]>([])
  const [shopTheLookConfig, setShopTheLookConfig] = useState<ShopTheLookConfig>({
    featuredProducts: [],
    enabled: true,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Modal states
  const [hotspotModalOpen, setHotspotModalOpen] = useState(false)
  const [editingHotspot, setEditingHotspot] = useState<ProductHotspot | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [hotspotToDelete, setHotspotToDelete] = useState<ProductHotspot | null>(null)

  // Dragging state
  const [draggingHotspotId, setDraggingHotspotId] = useState<string | null>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    productId: "",
    label: "",
    positionX: 50,
    positionY: 50,
  })

  // Load products from Firebase
  useEffect(() => {
    const unsub = subscribeToProducts((data) => {
      setProducts(data)
      setLoading(false)
    })
    return unsub
  }, [])

  // Load Shop the Look config
  useEffect(() => {
    const unsub = subscribeToShopTheLookConfig((config) => {
      setShopTheLookConfig(config)
    })
    return unsub
  }, [])

  // Load hotspots when product is selected
  useEffect(() => {
    if (!selectedProduct) {
      setHotspots([])
      return
    }

    const unsub = subscribeToProductHotspots(selectedProduct.id, (data) => {
      console.log("[v0] Loaded hotspots for product:", selectedProduct.id, data)
      setHotspots(data)
    })
    return unsub
  }, [selectedProduct])

  const saveHotspots = async () => {
    if (!selectedProduct) return

    setSaving(true)
    try {
      await updateProductHotspots(selectedProduct.id, hotspots)
      console.log("[v0] Saved hotspots for product:", selectedProduct.id, hotspots)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error("[v0] Error saving hotspots:", e)
    } finally {
      setSaving(false)
    }
  }

  const saveShopTheLookConfig = async () => {
    setSaving(true)
    try {
      await updateShopTheLookConfig(shopTheLookConfig)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error("[v0] Error saving config:", e)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      productId: "",
      label: "",
      positionX: 50,
      positionY: 50,
    })
  }

  const openAddHotspot = () => {
    resetForm()
    setEditingHotspot(null)
    setHotspotModalOpen(true)
  }

  const openEditHotspot = (hotspot: ProductHotspot) => {
    setEditingHotspot(hotspot)
    setFormData({
      productId: hotspot.productId,
      label: hotspot.label || getProductById(hotspot.productId)?.name || "Produto",
      positionX: hotspot.position.x,
      positionY: hotspot.position.y,
    })
    setHotspotModalOpen(true)
  }

  const handleSubmitHotspot = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.productId) return

    const hotspotData: ProductHotspot = {
      id: editingHotspot?.id || `hotspot-${Date.now()}`,
      productId: formData.productId,
      label: formData.label || getProductById(formData.productId)?.name || "Produto",
      imageIndex: selectedImageIndex,
      position: { x: formData.positionX, y: formData.positionY },
    }

    if (editingHotspot) {
      setHotspots((prev) => prev.map((h) => (h.id === editingHotspot.id ? hotspotData : h)))
    } else {
      setHotspots((prev) => [...prev, hotspotData])
    }

    setHotspotModalOpen(false)
    resetForm()
    setEditingHotspot(null)
  }

  const handleDeleteHotspot = () => {
    if (!hotspotToDelete) return
    setHotspots((prev) => prev.filter((h) => h.id !== hotspotToDelete.id))
    setDeleteDialogOpen(false)
    setHotspotToDelete(null)
  }

  const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.id === id)
  }

  // Handle drag on image
  const handleMouseDown = (e: React.MouseEvent, hotspotId: string) => {
    e.preventDefault()
    setDraggingHotspotId(hotspotId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingHotspotId || !imageContainerRef.current) return

    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100))

    setHotspots((prev) => prev.map((h) => (h.id === draggingHotspotId ? { ...h, position: { x, y } } : h)))
  }

  const handleMouseUp = () => {
    setDraggingHotspotId(null)
  }

  // Filter products for search
  const filteredProducts = products.filter(
    (p) =>
      p.active &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Get hotspots for current image
  const currentImageHotspots = hotspots.filter((h) => h.imageIndex === selectedImageIndex)

  // Toggle featured product
  const toggleFeaturedProduct = (productId: string) => {
    const isFeatured = shopTheLookConfig.featuredProducts.some((f) => f.productId === productId)

    if (isFeatured) {
      setShopTheLookConfig((prev) => ({
        ...prev,
        featuredProducts: prev.featuredProducts.filter((f) => f.productId !== productId),
      }))
    } else {
      setShopTheLookConfig((prev) => ({
        ...prev,
        featuredProducts: [...prev.featuredProducts, { productId, order: prev.featuredProducts.length + 1 }],
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Shop the Look</h2>
          <p className="text-sm text-zinc-400">Configure hotspots em produtos para mostrar itens relacionados</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-zinc-300 text-sm">Seção Ativa</Label>
            <Switch
              checked={shopTheLookConfig.enabled}
              onCheckedChange={(checked) => setShopTheLookConfig((prev) => ({ ...prev, enabled: checked }))}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="hotspots" className="space-y-6">
        <TabsList className="bg-zinc-800 border border-zinc-700">
          <TabsTrigger value="hotspots" className="data-[state=active]:bg-rose-500">
            Configurar Hotspots
          </TabsTrigger>
          <TabsTrigger value="featured" className="data-[state=active]:bg-rose-500">
            Produtos em Destaque
          </TabsTrigger>
        </TabsList>

        {/* Tab: Configurar Hotspots */}
        <TabsContent value="hotspots" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Selection */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Selecionar Produto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar produto..."
                    className="pl-9 bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>

                {/* Product List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProduct?.id === product.id
                    return (
                      <button
                        key={product.id}
                        onClick={() => {
                          setSelectedProduct(product)
                          setSelectedImageIndex(0)
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                          isSelected
                            ? "bg-rose-500/20 border border-rose-500/50"
                            : "bg-zinc-800 hover:bg-zinc-700 border border-transparent"
                        }`}
                      >
                        {product.images[0] ? (
                          <img
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-zinc-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-100 truncate text-sm">{product.name}</p>
                          <p className="text-xs text-zinc-500">{product.category}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Image Preview with Hotspots */}
            <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Configurar Hotspots
                </CardTitle>
                {selectedProduct && (
                  <Button
                    onClick={saveHotspots}
                    disabled={saving}
                    className={saved ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"}
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Hotspots"}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {selectedProduct ? (
                  <div className="space-y-4">
                    {/* Image Navigation */}
                    {selectedProduct.images.length > 1 && (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setSelectedImageIndex((prev) => (prev === 0 ? selectedProduct.images.length - 1 : prev - 1))
                          }
                          className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-zinc-400 text-sm">
                          Imagem {selectedImageIndex + 1} de {selectedProduct.images.length}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setSelectedImageIndex((prev) => (prev === selectedProduct.images.length - 1 ? 0 : prev + 1))
                          }
                          className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Image with Hotspots */}
                    <div
                      ref={imageContainerRef}
                      className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-800 cursor-crosshair max-w-md mx-auto"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <img
                        src={selectedProduct.images[selectedImageIndex] || "/placeholder.svg"}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover object-top"
                      />

                      {/* Hotspots */}
                      {currentImageHotspots.map((hotspot) => {
                        const product = getProductById(hotspot.productId)
                        return (
                          <div
                            key={hotspot.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 ${
                              draggingHotspotId === hotspot.id ? "cursor-grabbing" : "cursor-grab"
                            }`}
                            style={{ left: `${hotspot.position.x}%`, top: `${hotspot.position.y}%` }}
                            onMouseDown={(e) => handleMouseDown(e, hotspot.id)}
                          >
                            <span className="absolute inset-0 w-10 h-10 -m-1 rounded-full bg-rose-500/30 animate-ping" />
                            <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-lg text-zinc-900 hover:bg-rose-500 hover:text-white transition-colors">
                              <Plus className="w-4 h-4" />
                            </span>

                            {/* Tooltip */}
                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-zinc-800 rounded-lg px-2 py-1 whitespace-nowrap text-xs">
                              <span className="text-zinc-300">{hotspot.label}</span>
                              {product && <span className="text-rose-400 ml-1">{formatCurrency(product.price)}</span>}
                            </div>
                          </div>
                        )
                      })}

                      {/* Instructions overlay */}
                      <div className="absolute bottom-2 left-2 right-2 bg-zinc-900/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-zinc-400">
                        <Move className="w-3 h-3 inline mr-1" />
                        Arraste os hotspots para reposicioná-los
                      </div>
                    </div>

                    {/* Hotspots List for Current Image */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-zinc-300">
                          Hotspots nesta imagem ({currentImageHotspots.length})
                        </h4>
                        <Button onClick={openAddHotspot} size="sm" className="bg-rose-500 hover:bg-rose-600">
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar
                        </Button>
                      </div>

                      {currentImageHotspots.length === 0 ? (
                        <div className="text-center py-4 text-zinc-500 text-sm">
                          Nenhum hotspot nesta imagem. Clique em "Adicionar" para criar um.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {currentImageHotspots.map((hotspot) => {
                            const product = getProductById(hotspot.productId)
                            return (
                              <div key={hotspot.id} className="flex items-center gap-3 p-2 bg-zinc-800 rounded-lg">
                                <GripVertical className="w-4 h-4 text-zinc-500" />
                                {product?.images[0] ? (
                                  <img
                                    src={product.images[0] || "/placeholder.svg"}
                                    alt={product.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4 text-zinc-500" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-zinc-100 truncate text-sm">{hotspot.label}</p>
                                  <p className="text-xs text-zinc-500">
                                    {product ? formatCurrency(product.price) : "Produto não encontrado"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditHotspot(hotspot)}
                                    className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 h-8 w-8"
                                  >
                                    <Move className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setHotspotToDelete(hotspot)
                                      setDeleteDialogOpen(true)
                                    }}
                                    className="text-zinc-400 hover:text-red-400 hover:bg-zinc-700 h-8 w-8"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[3/4] rounded-xl bg-zinc-800 flex flex-col items-center justify-center text-zinc-500 max-w-md mx-auto">
                    <Package className="w-12 h-12 mb-2" />
                    <p>Selecione um produto na lista</p>
                    <p className="text-xs mt-1">para configurar os hotspots</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Produtos em Destaque */}
        <TabsContent value="featured" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-zinc-100 text-lg">Produtos em Destaque</CardTitle>
                <p className="text-sm text-zinc-400 mt-1">
                  Selecione os produtos que aparecerão na seção "Shop the Look" da página inicial
                </p>
              </div>
              <Button
                onClick={saveShopTheLookConfig}
                disabled={saving}
                className={saved ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products
                  .filter((p) => p.active)
                  .map((product) => {
                    const isFeatured = shopTheLookConfig.featuredProducts.some((f) => f.productId === product.id)
                    return (
                      <button
                        key={product.id}
                        onClick={() => toggleFeaturedProduct(product.id)}
                        className={`relative p-2 rounded-xl transition-all text-left ${
                          isFeatured ? "bg-rose-500/20 ring-2 ring-rose-500" : "bg-zinc-800 hover:bg-zinc-700"
                        }`}
                      >
                        {isFeatured && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {shopTheLookConfig.featuredProducts.findIndex((f) => f.productId === product.id) + 1}
                            </span>
                          </div>
                        )}
                        {product.images[0] ? (
                          <img
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full aspect-square rounded-lg object-cover mb-2"
                          />
                        ) : (
                          <div className="w-full aspect-square rounded-lg bg-zinc-700 flex items-center justify-center mb-2">
                            <ImageIcon className="w-8 h-8 text-zinc-500" />
                          </div>
                        )}
                        <p className="font-medium text-zinc-100 truncate text-sm">{product.name}</p>
                        <p className="text-xs text-zinc-500">{formatCurrency(product.price)}</p>
                      </button>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hotspot Modal */}
      <Dialog open={hotspotModalOpen} onOpenChange={setHotspotModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">{editingHotspot ? "Editar Hotspot" : "Novo Hotspot"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitHotspot} className="space-y-4">
            <div>
              <Label className="text-zinc-300">Produto para vincular</Label>
              <Select
                value={formData.productId}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    productId: value,
                    label: prev.label || getProductById(value)?.name || "",
                  }))
                }}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 max-h-60">
                  {(() => {
                    const activeProducts = products.filter((p) => p.active)

                    if (activeProducts.length === 0) {
                      return (
                        <div className="p-3 text-center text-zinc-400 text-sm">Nenhum produto ativo disponível.</div>
                      )
                    }

                    return activeProducts.map((product) => {
                      const isFeatured = shopTheLookConfig.featuredProducts.some((f) => f.productId === product.id)
                      const isCurrentProduct = product.id === selectedProduct?.id
                      return (
                        <SelectItem key={product.id} value={product.id} className="text-zinc-100">
                          <div className="flex items-center gap-2">
                            <span>{product.name}</span>
                            <span className="text-zinc-500">- {formatCurrency(product.price)}</span>
                            {isFeatured && <span className="text-rose-400 text-xs">(Destaque)</span>}
                            {isCurrentProduct && <span className="text-emerald-400 text-xs">(Este produto)</span>}
                          </div>
                        </SelectItem>
                      )
                    })
                  })()}
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500 mt-1">Selecione o produto que será exibido ao clicar no hotspot</p>
            </div>

            <div>
              <Label className="text-zinc-300">Rótulo (opcional)</Label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="Ex: Top, Calcinha, Biquíni..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
              />
              <p className="text-xs text-zinc-500 mt-1">Se vazio, usará o nome do produto</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Posição X (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.positionX}
                  onChange={(e) => setFormData((prev) => ({ ...prev, positionX: Number(e.target.value) }))}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Posição Y (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.positionY}
                  onChange={(e) => setFormData((prev) => ({ ...prev, positionY: Number(e.target.value) }))}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                />
              </div>
            </div>

            <p className="text-xs text-zinc-500">
              Dica: Você pode arrastar os hotspots diretamente na imagem para ajustar a posição
            </p>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setHotspotModalOpen(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-rose-500 hover:bg-rose-600" disabled={!formData.productId}>
                {editingHotspot ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Remover Hotspot</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja remover o hotspot "{hotspotToDelete?.label}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHotspot} className="bg-red-500 hover:bg-red-600 text-white">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
