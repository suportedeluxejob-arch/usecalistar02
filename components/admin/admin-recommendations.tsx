"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Plus, Trash2, Edit2, GripVertical, Loader2, Package, ImageIcon } from "lucide-react"
import { subscribeToProducts, type Product } from "@/lib/firebase-products"
import {
  subscribeToRecommendationSections,
  createRecommendationSection,
  updateRecommendationSection,
  deleteRecommendationSection,
  type RecommendationSection,
} from "@/lib/firebase-store-config"
import { formatCurrency } from "@/lib/utils"

const SECTION_TYPES = [
  { value: "related", label: "Produtos Relacionados" },
  { value: "upsell", label: "Upsell (upgrade)" },
  { value: "cross-sell", label: "Cross-sell (complementar)" },
  { value: "custom", label: "Personalizado" },
]

const CATEGORIES = [
  { value: "conjuntos", label: "Conjuntos" },
  { value: "tops", label: "Tops" },
  { value: "calcinhas", label: "Calcinhas" },
]

export function AdminRecommendations() {
  const [products, setProducts] = useState<Product[]>([])
  const [sections, setSections] = useState<RecommendationSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<RecommendationSection | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<RecommendationSection | null>(null)

  // Form state
  const [formData, setFormData] = useState<{
    title: string
    description: string
    type: "related" | "upsell" | "cross-sell" | "custom"
    productIds: string[]
    showOnCategories: string[]
    enabled: boolean
    order: number
  }>({
    title: "",
    description: "",
    type: "related",
    productIds: [],
    showOnCategories: ["conjuntos", "tops", "calcinhas"],
    enabled: true,
    order: 1,
  })

  // Load products
  useEffect(() => {
    const unsub = subscribeToProducts((data) => {
      setProducts(data)
    })
    return unsub
  }, [])

  // Load sections
  useEffect(() => {
    const unsub = subscribeToRecommendationSections((data) => {
      setSections(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "related",
      productIds: [],
      showOnCategories: ["conjuntos", "tops", "calcinhas"],
      enabled: true,
      order: sections.length + 1,
    })
  }

  const openAddModal = () => {
    resetForm()
    setEditingSection(null)
    setModalOpen(true)
  }

  const openEditModal = (section: RecommendationSection) => {
    setEditingSection(section)
    setFormData({
      title: section.title,
      description: section.description || "",
      type: section.type,
      productIds: section.productIds || [],
      showOnCategories: section.showOnCategories || [],
      enabled: section.enabled,
      order: section.order,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return

    setSaving(true)
    try {
      if (editingSection) {
        await updateRecommendationSection(editingSection.id, formData)
      } else {
        await createRecommendationSection(formData)
      }
      setModalOpen(false)
      resetForm()
      setEditingSection(null)
    } catch (error) {
      console.error("Error saving section:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!sectionToDelete) return
    try {
      await deleteRecommendationSection(sectionToDelete.id)
      setDeleteDialogOpen(false)
      setSectionToDelete(null)
    } catch (error) {
      console.error("Error deleting section:", error)
    }
  }

  const handleToggleEnabled = async (section: RecommendationSection) => {
    try {
      await updateRecommendationSection(section.id, { enabled: !section.enabled })
    } catch (error) {
      console.error("Error toggling section:", error)
    }
  }

  const toggleProductSelection = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }))
  }

  const toggleCategorySelection = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      showOnCategories: prev.showOnCategories.includes(category)
        ? prev.showOnCategories.filter((c) => c !== category)
        : [...prev.showOnCategories, category],
    }))
  }

  const getProductById = (id: string) => products.find((p) => p.id === id)

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
          <h2 className="text-xl font-semibold text-zinc-100">Seções de Recomendação</h2>
          <p className="text-sm text-zinc-400">
            Gerencie as seções que aparecem na página de produtos (ex: "Você também pode gostar", "Monte seu conjunto")
          </p>
        </div>
        <Button onClick={openAddModal} className="bg-rose-500 hover:bg-rose-600">
          <Plus className="w-4 h-4 mr-2" />
          Nova Seção
        </Button>
      </div>

      {/* Sections List */}
      {sections.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-12">
            <div className="text-center text-zinc-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma seção de recomendação configurada</p>
              <p className="text-sm mt-1">Crie seções como "Monte seu conjunto" ou "Você também pode gostar"</p>
              <Button onClick={openAddModal} className="mt-4 bg-rose-500 hover:bg-rose-600">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Seção
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-zinc-800 rounded-lg text-zinc-400">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-zinc-100">{section.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                        {SECTION_TYPES.find((t) => t.value === section.type)?.label}
                      </span>
                      {!section.enabled && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Desativado</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">
                      {section.productIds?.length || 0} produtos • Aparece em:{" "}
                      {section.showOnCategories?.join(", ") || "todas categorias"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={section.enabled} onCheckedChange={() => handleToggleEnabled(section)} />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(section)}
                      className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSectionToDelete(section)
                        setDeleteDialogOpen(true)
                      }}
                      className="text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Products preview */}
                {section.productIds && section.productIds.length > 0 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                    {section.productIds.slice(0, 6).map((productId) => {
                      const product = getProductById(productId)
                      if (!product) return null
                      return (
                        <div key={productId} className="flex-shrink-0 w-16">
                          <div className="w-16 h-20 rounded-lg overflow-hidden bg-zinc-800">
                            {product.images[0] ? (
                              <img
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-zinc-600" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 truncate mt-1">{product.name}</p>
                        </div>
                      )
                    })}
                    {section.productIds.length > 6 && (
                      <div className="flex-shrink-0 w-16 h-20 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <span className="text-xs text-zinc-400">+{section.productIds.length - 6}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              {editingSection ? "Editar Seção" : "Nova Seção de Recomendação"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-300">Título da Seção</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Monte seu conjunto"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                />
              </div>

              <div>
                <Label className="text-zinc-300">Descrição (opcional)</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Complete seu look com peças que combinam"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                />
              </div>

              <div>
                <Label className="text-zinc-300">Tipo de Seção</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {SECTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-zinc-100">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Show on Categories */}
            <div>
              <Label className="text-zinc-300 mb-2 block">Mostrar em quais categorias de produto?</Label>
              <div className="flex gap-4">
                {CATEGORIES.map((cat) => (
                  <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.showOnCategories.includes(cat.value)}
                      onCheckedChange={() => toggleCategorySelection(cat.value)}
                    />
                    <span className="text-sm text-zinc-300">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Products Selection */}
            <div>
              <Label className="text-zinc-300 mb-2 block">
                Selecione os produtos ({formData.productIds.length} selecionados)
              </Label>
              <div className="bg-zinc-800 rounded-lg p-3 max-h-[300px] overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {products
                    .filter((p) => p.active)
                    .map((product) => (
                      <label
                        key={product.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          formData.productIds.includes(product.id)
                            ? "bg-rose-500/20 ring-1 ring-rose-500"
                            : "hover:bg-zinc-700"
                        }`}
                      >
                        <Checkbox
                          checked={formData.productIds.includes(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                        <div className="w-10 h-12 rounded overflow-hidden bg-zinc-700 flex-shrink-0">
                          {product.images[0] ? (
                            <img
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-zinc-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-zinc-100 truncate">{product.name}</p>
                          <p className="text-xs text-zinc-500">{formatCurrency(product.price)}</p>
                        </div>
                      </label>
                    ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-rose-500 hover:bg-rose-600" disabled={!formData.title || saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingSection ? "Salvar Alterações" : "Criar Seção"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Excluir Seção</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir a seção "{sectionToDelete?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
