"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Loader2, ImageIcon, Eye, Layers } from "lucide-react"
import {
  subscribeToCategoryBannersConfig,
  updateCategoryBanner,
  type CategoryBannersConfig,
  type CategoryBannerConfig,
} from "@/lib/firebase-store-config"

const categoryLabels = {
  conjuntos: { name: "Conjuntos", emoji: "👙" },
  tops: { name: "Tops", emoji: "👚" },
  calcinhas: { name: "Calcinhas", emoji: "🩲" },
}

export function AdminCategoryBanners() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [config, setConfig] = useState<CategoryBannersConfig | null>(null)

  useEffect(() => {
    const unsub = subscribeToCategoryBannersConfig((data) => {
      setConfig(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const saveCategory = async (category: keyof CategoryBannersConfig) => {
    if (!config) return
    setSaving(category)
    try {
      await updateCategoryBanner(category, config[category])
      setSaved(category)
      setTimeout(() => setSaved(null), 2000)
    } catch (e) {
      console.error("Error saving category banner:", e)
    } finally {
      setSaving(null)
    }
  }

  const handleChange = (
    category: keyof CategoryBannersConfig,
    field: keyof CategoryBannerConfig,
    value: string | boolean,
  ) => {
    if (!config) return
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            [category]: { ...prev[category], [field]: value },
          }
        : prev,
    )
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
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Banners das Categorias</h2>
        <p className="text-sm text-zinc-400">Gerencie os banners hero de cada página de categoria</p>
      </div>

      <Tabs defaultValue="conjuntos" className="space-y-6">
        <TabsList className="bg-zinc-800 border-zinc-700">
          {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((cat) => (
            <TabsTrigger key={cat} value={cat} className="data-[state=active]:bg-rose-500">
              {categoryLabels[cat].emoji} {categoryLabels[cat].name}
            </TabsTrigger>
          ))}
        </TabsList>

        {(Object.keys(categoryLabels) as Array<keyof CategoryBannersConfig>).map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Preview */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Preview do Banner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-zinc-800 rounded-xl p-6 space-y-4">
                    {/* Badge */}
                    {config[category].badge && (
                      <span className="inline-block text-rose-400 text-xs uppercase tracking-widest">
                        {config[category].badge}
                      </span>
                    )}

                    {/* Title */}
                    <h3 className="text-3xl font-bold text-zinc-100">
                      {config[category].title || "Título da Categoria"}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-zinc-400 line-clamp-3">
                      {config[category].description || "Descrição da categoria..."}
                    </p>

                    {/* Image Preview */}
                    <div className="aspect-[4/3] bg-zinc-700 rounded-lg overflow-hidden">
                      {config[category].image ? (
                        <img
                          src={config[category].image || "/placeholder.svg"}
                          alt={config[category].title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-zinc-500" />
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          config[category].enabled ? "bg-emerald-500" : "bg-zinc-500"
                        }`}
                      />
                      <span className="text-xs text-zinc-400">{config[category].enabled ? "Ativo" : "Desativado"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Editor */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Editar {categoryLabels[category].name}
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-zinc-300 text-sm">Ativo</Label>
                        <Switch
                          checked={config[category].enabled}
                          onCheckedChange={(checked) => handleChange(category, "enabled", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-zinc-300">Badge (opcional)</Label>
                    <Input
                      value={config[category].badge || ""}
                      onChange={(e) => handleChange(category, "badge", e.target.value)}
                      placeholder="Ex: Coleção"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Título</Label>
                    <Input
                      value={config[category].title}
                      onChange={(e) => handleChange(category, "title", e.target.value)}
                      placeholder="Ex: Conjuntos"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Descrição</Label>
                    <Textarea
                      value={config[category].description}
                      onChange={(e) => handleChange(category, "description", e.target.value)}
                      placeholder="Descrição da categoria..."
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Imagem (URL)</Label>
                    <Input
                      value={config[category].image}
                      onChange={(e) => handleChange(category, "image", e.target.value)}
                      placeholder="URL da imagem do banner..."
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                    />
                  </div>

                  <Button
                    onClick={() => saveCategory(category)}
                    disabled={saving === category}
                    className={`w-full ${
                      saved === category ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
                    }`}
                  >
                    {saving === category ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {saving === category ? "Salvando..." : saved === category ? "Salvo!" : "Salvar Alterações"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
