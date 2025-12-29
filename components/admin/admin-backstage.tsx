"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, Plus, Trash2, ImageIcon, GripVertical } from "lucide-react"
import {
  subscribeToBackstageConfig,
  updateBackstageConfig,
  type BackstageConfig,
  type BackstageImage,
} from "@/lib/firebase-store-config"

export function AdminBackstage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState<BackstageConfig | null>(null)

  useEffect(() => {
    const unsub = subscribeToBackstageConfig((data) => {
      setConfig(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const saveConfig = async () => {
    if (!config) return
    setSaving(true)
    try {
      await updateBackstageConfig(config)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error("Error saving backstage config:", e)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof BackstageConfig, value: any) => {
    if (!config) return
    setConfig((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const updateImage = (index: number, field: keyof BackstageImage, value: string) => {
    if (!config) return
    const newImages = [...config.images]
    newImages[index] = { ...newImages[index], [field]: value }
    handleChange("images", newImages)
  }

  const addImage = () => {
    if (!config) return
    const newImage: BackstageImage = {
      id: Date.now().toString(),
      image: "",
      caption: "Nova imagem",
      size: "normal",
      order: config.images.length,
    }
    handleChange("images", [...config.images, newImage])
  }

  const removeImage = (index: number) => {
    if (!config) return
    const newImages = config.images.filter((_, i) => i !== index)
    // Reorder remaining images
    const reordered = newImages.map((img, i) => ({ ...img, order: i }))
    handleChange("images", reordered)
  }

  const moveImage = (index: number, direction: "up" | "down") => {
    if (!config) return
    const newImages = [...config.images]
    const newIndex = direction === "up" ? index - 1 : index + 1

    if (newIndex < 0 || newIndex >= newImages.length) return

    // Swap
    const temp = newImages[index]
    newImages[index] = newImages[newIndex]
    newImages[newIndex] = temp

    // Update order
    const reordered = newImages.map((img, i) => ({ ...img, order: i }))
    handleChange("images", reordered)
  }

  if (loading || !config) {
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
          <h2 className="text-xl font-semibold text-zinc-100">Galeria de Bastidores</h2>
          <p className="text-sm text-zinc-400">Gerencie as imagens da seção de bastidores na página Nossa História</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-zinc-300 text-sm">Ativo</Label>
            <Switch checked={config.enabled} onCheckedChange={(checked) => handleChange("enabled", checked)} />
          </div>
          <Button
            onClick={saveConfig}
            disabled={saving}
            className={saved ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      {/* Section Settings */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 text-lg">Configurações da Seção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-zinc-300">Título da Seção</Label>
            <Input
              value={config.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Bastidores"
              className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
            />
          </div>
          <div>
            <Label className="text-zinc-300">Descrição</Label>
            <Input
              value={config.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descrição da seção..."
              className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Images Grid Preview */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Preview da Grade ({config.images.length} imagens)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 p-4 bg-zinc-800/50 rounded-lg">
            {config.images
              .sort((a, b) => a.order - b.order)
              .map((img, index) => (
                <div
                  key={img.id}
                  className={`relative bg-zinc-700 rounded overflow-hidden ${
                    img.size === "large" ? "col-span-2 row-span-2" : ""
                  }`}
                  style={{ aspectRatio: "1/1" }}
                >
                  {img.image ? (
                    <img
                      src={img.image || "/placeholder.svg"}
                      alt={img.caption || "Bastidor"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                    {index + 1}. {img.caption || "Sem legenda"}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Images List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-100">Imagens</h3>
          <Button
            onClick={addImage}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 bg-transparent"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Imagem
          </Button>
        </div>

        {config.images
          .sort((a, b) => a.order - b.order)
          .map((img, index) => (
            <Card key={img.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Drag Handle & Order */}
                  <div className="flex flex-col items-center gap-1 pt-2">
                    <GripVertical className="w-5 h-5 text-zinc-500" />
                    <span className="text-xs text-zinc-500">#{index + 1}</span>
                    <div className="flex flex-col gap-1 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveImage(index, "up")}
                        disabled={index === 0}
                        className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-100"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveImage(index, "down")}
                        disabled={index === config.images.length - 1}
                        className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-100"
                      >
                        ↓
                      </Button>
                    </div>
                  </div>

                  {/* Image Preview */}
                  <div
                    className={`relative bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 ${
                      img.size === "large" ? "w-32 h-32" : "w-20 h-20"
                    }`}
                  >
                    {img.image ? (
                      <img
                        src={img.image || "/placeholder.svg"}
                        alt={img.caption || "Preview"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Fields */}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-zinc-400 text-xs">URL da Imagem</Label>
                        <Input
                          value={img.image}
                          onChange={(e) => updateImage(index, "image", e.target.value)}
                          placeholder="https://..."
                          className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-zinc-400 text-xs">Legenda</Label>
                        <Input
                          value={img.caption || ""}
                          onChange={(e) => updateImage(index, "caption", e.target.value)}
                          placeholder="Descrição da imagem"
                          className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 h-9 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <Label className="text-zinc-400 text-xs">Tamanho</Label>
                        <Select
                          value={img.size}
                          onValueChange={(value: "normal" | "large") => updateImage(index, "size", value)}
                        >
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 w-40 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="normal" className="text-zinc-100">
                              Normal
                            </SelectItem>
                            <SelectItem value="large" className="text-zinc-100">
                              Grande (2x2)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

        {config.images.length === 0 && (
          <Card className="bg-zinc-900 border-zinc-800 border-dashed">
            <CardContent className="p-8 text-center">
              <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">Nenhuma imagem adicionada</p>
              <p className="text-zinc-500 text-sm mt-1">Clique em "Adicionar Imagem" para começar</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
