"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Search, Edit, Trash2, ImageIcon, X } from "lucide-react"
import {
  subscribeToProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
  type ProductInput,
} from "@/lib/firebase-products"
import { formatCurrency } from "@/lib/utils"

const categories = [
  { value: "conjuntos", label: "Conjuntos" },
  { value: "tops", label: "Tops" },
  { value: "calcinhas", label: "Calcinhas" },
]

const sizes = ["PP", "P", "M", "G", "GG"]
const defaultColors = ["Preto", "Branco", "Rosa", "Azul", "Verde", "Vermelho", "Nude", "Animal Print"]

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState<ProductInput>({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    discount: 0,
    images: [],
    category: "conjuntos",
    sizes: [],
    colors: [],
    tags: [],
    stock: 10,
    featured: false,
    active: true,
  })
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    const unsub = subscribeToProducts((data) => {
      setProducts(data)
      setLoading(false)
    })
    return unsub
  }, [])

  // Listen for open modal event
  useEffect(() => {
    const handleOpenModal = () => {
      resetForm()
      setEditingProduct(null)
      setModalOpen(true)
    }

    window.addEventListener("openProductModal", handleOpenModal)
    return () => window.removeEventListener("openProductModal", handleOpenModal)
  }, [])

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      originalPrice: 0,
      discount: 0,
      images: [],
      category: "conjuntos",
      sizes: [],
      colors: [],
      tags: [],
      stock: 10,
      featured: false,
      active: true,
    })
    setImageUrls([])
    setNewTag("")
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      discount: product.discount || 0,
      images: product.images || [],
      category: product.category,
      sizes: product.sizes || [],
      colors: product.colors || [],
      tags: product.tags || [],
      stock: product.stock,
      featured: product.featured,
      active: product.active,
    })
    setImageUrls(product.images || [])
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const productData: ProductInput = {
        ...formData,
        images: imageUrls.filter((url) => url.trim() !== ""),
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
      } else {
        await createProduct(productData)
      }

      setModalOpen(false)
      resetForm()
      setEditingProduct(null)
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      await deleteProduct(productToDelete.id)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ""])
  }

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls]
    newUrls[index] = value
    setImageUrls(newUrls)
  }

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] })
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  const toggleSize = (size: string) => {
    if (formData.sizes.includes(size)) {
      setFormData({ ...formData, sizes: formData.sizes.filter((s) => s !== size) })
    } else {
      setFormData({ ...formData, sizes: [...formData.sizes, size] })
    }
  }

  const toggleColor = (color: string) => {
    if (formData.colors.includes(color)) {
      setFormData({ ...formData, colors: formData.colors.filter((c) => c !== color) })
    } else {
      setFormData({ ...formData, colors: [...formData.colors, color] })
    }
  }

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || product.category === filterCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-zinc-900 border-zinc-800 text-zinc-100">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all" className="text-zinc-100">
              Todas categorias
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value} className="text-zinc-100">
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="w-12 h-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 mb-4">Nenhum produto encontrado</p>
            <Button
              onClick={() => {
                resetForm()
                setEditingProduct(null)
                setModalOpen(true)
              }}
              className="bg-rose-500 hover:bg-rose-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro produto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="bg-zinc-900 border-zinc-800 overflow-hidden group">
              <div className="relative aspect-square">
                {product.images[0] ? (
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-zinc-600" />
                  </div>
                )}

                {/* Status badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {!product.active && (
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                      Inativo
                    </Badge>
                  )}
                  {product.featured && <Badge className="bg-rose-500 text-white">Destaque</Badge>}
                  {product.discount && product.discount > 0 && (
                    <Badge className="bg-emerald-500 text-white">-{product.discount}%</Badge>
                  )}
                </div>

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openEditModal(product)}
                    className="bg-zinc-100 text-zinc-900 hover:bg-white"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setProductToDelete(product)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-medium text-zinc-100 truncate">{product.name}</h3>
                <p className="text-sm text-zinc-500 capitalize">{product.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-rose-400">{formatCurrency(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-zinc-500 line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <span className={`text-sm ${product.stock < 5 ? "text-amber-400" : "text-zinc-500"}`}>
                    {product.stock} un.
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-zinc-300">
                  Nome do Produto
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-zinc-300">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 min-h-24"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-zinc-300">
                  Categoria
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: "conjuntos" | "tops" | "calcinhas") =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-zinc-100">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300">Preços</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price" className="text-zinc-400 text-xs">
                    Preço Final (R$)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice" className="text-zinc-400 text-xs">
                    Preço Original (R$)
                  </Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: Number.parseFloat(e.target.value) || 0 })
                    }
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
                <div>
                  <Label htmlFor="discount" className="text-zinc-400 text-xs">
                    Desconto (%)
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Number.parseInt(e.target.value) || 0 })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
              </div>
            </div>

            {/* Stock */}
            <div>
              <Label htmlFor="stock" className="text-zinc-300">
                Estoque
              </Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 w-32"
                required
              />
            </div>

            {/* Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Imagens (URLs)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addImageUrl}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImageUrl(index)}
                    className="text-zinc-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {/* Image preview */}
              {imageUrls.filter((url) => url).length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {imageUrls
                    .filter((url) => url)
                    .map((url, index) => (
                      <img
                        key={index}
                        src={url || "/placeholder.svg?height=64&width=64"}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border border-zinc-700"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=64&width=64"
                        }}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Sizes */}
            <div className="space-y-3">
              <Label className="text-zinc-300">Tamanhos</Label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <Button
                    key={size}
                    type="button"
                    variant={formData.sizes.includes(size) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSize(size)}
                    className={
                      formData.sizes.includes(size)
                        ? "bg-rose-500 hover:bg-rose-600"
                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    }
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <Label className="text-zinc-300">Cores</Label>
              <div className="flex flex-wrap gap-2">
                {defaultColors.map((color) => (
                  <Button
                    key={color}
                    type="button"
                    variant={formData.colors.includes(color) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleColor(color)}
                    className={
                      formData.colors.includes(color)
                        ? "bg-rose-500 hover:bg-rose-600"
                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    }
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label className="text-zinc-300">Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nova tag..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                >
                  Adicionar
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-zinc-800 text-zinc-300 cursor-pointer hover:bg-red-900/50"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <div className="flex items-center gap-3">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active" className="text-zinc-300">
                  Produto Ativo
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured" className="text-zinc-300">
                  Destaque
                </Label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-rose-500 hover:bg-rose-600">
                {saving ? "Salvando..." : editingProduct ? "Salvar Alterações" : "Criar Produto"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Excluir Produto</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir "{productToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
