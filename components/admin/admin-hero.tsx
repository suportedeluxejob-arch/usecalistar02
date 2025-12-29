"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Save, Loader2, ImageIcon, Eye, BarChart3 } from "lucide-react"
import { subscribeToHeroConfig, updateHeroConfig, type HeroConfig } from "@/lib/firebase-store-config"

export function AdminHero() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState<HeroConfig>({
    title: "",
    titleHighlight: "",
    subtitle: "",
    badge: "",
    mainImage: "",
    secondaryImage: "",
    discountText: "",
    discountSubtext: "",
    stat1Value: "",
    stat1Label: "",
    stat2Value: "",
    stat2Label: "",
    stat3Value: "",
    stat3Label: "",
    enabled: true,
  })

  useEffect(() => {
    const unsub = subscribeToHeroConfig((data) => {
      setConfig(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const saveConfig = async () => {
    setSaving(true)
    try {
      await updateHeroConfig(config)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error("Error saving hero config:", e)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof HeroConfig, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
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
          <h2 className="text-xl font-semibold text-zinc-100">Seção Hero (Capa)</h2>
          <p className="text-sm text-zinc-400">Gerencie a primeira seção que aparece na loja</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-zinc-800 rounded-xl p-6 space-y-4">
              {/* Badge */}
              {config.badge && (
                <span className="inline-block bg-rose-500/20 text-rose-400 text-xs px-3 py-1 rounded-full">
                  {config.badge}
                </span>
              )}

              {/* Title */}
              <div>
                <h3 className="text-2xl font-bold text-zinc-100">{config.title || "Título"}</h3>
                <h3 className="text-2xl font-bold text-rose-400 italic">{config.titleHighlight || "Destaque"}</h3>
              </div>

              {/* Subtitle */}
              <p className="text-sm text-zinc-400 line-clamp-3">{config.subtitle || "Subtítulo da seção..."}</p>

              {/* Images Preview */}
              <div className="flex gap-4">
                <div className="w-24 h-32 bg-zinc-700 rounded-lg overflow-hidden">
                  {config.mainImage ? (
                    <img
                      src={config.mainImage || "/placeholder.svg"}
                      alt="Principal"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="w-16 h-20 bg-zinc-700 rounded-lg overflow-hidden">
                  {config.secondaryImage ? (
                    <img
                      src={config.secondaryImage || "/placeholder.svg"}
                      alt="Secundária"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-zinc-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Discount Badge Preview */}
              {config.discountText && (
                <div className="inline-block bg-rose-500 text-white px-3 py-2 rounded-lg text-center">
                  <div className="text-lg font-bold">{config.discountText}</div>
                  <div className="text-xs">{config.discountSubtext}</div>
                </div>
              )}

              {/* Stats Preview */}
              <div className="flex gap-4 text-center text-xs">
                <div>
                  <div className="font-bold text-zinc-100">{config.stat1Value || "0"}</div>
                  <div className="text-zinc-500">{config.stat1Label || "Stat 1"}</div>
                </div>
                <div>
                  <div className="font-bold text-zinc-100">{config.stat2Value || "0"}</div>
                  <div className="text-zinc-500">{config.stat2Label || "Stat 2"}</div>
                </div>
                <div>
                  <div className="font-bold text-zinc-100">{config.stat3Value || "0"}</div>
                  <div className="text-zinc-500">{config.stat3Label || "Stat 3"}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <div className="space-y-6">
          {/* Texts */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-lg">Textos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-zinc-300">Badge</Label>
                <Input
                  value={config.badge}
                  onChange={(e) => handleChange("badge", e.target.value)}
                  placeholder="Ex: Coleção Verão 2025"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Título Principal</Label>
                <Input
                  value={config.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Ex: O Verão dos"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Título Destaque (em itálico)</Label>
                <Input
                  value={config.titleHighlight}
                  onChange={(e) => handleChange("titleHighlight", e.target.value)}
                  placeholder="Ex: Seus Sonhos"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Subtítulo</Label>
                <Textarea
                  value={config.subtitle}
                  onChange={(e) => handleChange("subtitle", e.target.value)}
                  placeholder="Descrição da seção..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Imagens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-zinc-300">Imagem Principal</Label>
                <Input
                  value={config.mainImage}
                  onChange={(e) => handleChange("mainImage", e.target.value)}
                  placeholder="URL da imagem principal"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Imagem Secundária (menor)</Label>
                <Input
                  value={config.secondaryImage}
                  onChange={(e) => handleChange("secondaryImage", e.target.value)}
                  placeholder="URL da imagem secundária"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Discount Badge */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-lg">Badge de Desconto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Texto do Desconto</Label>
                  <Input
                    value={config.discountText}
                    onChange={(e) => handleChange("discountText", e.target.value)}
                    placeholder="Ex: -30%"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Subtexto</Label>
                  <Input
                    value={config.discountSubtext}
                    onChange={(e) => handleChange("discountSubtext", e.target.value)}
                    placeholder="Ex: Primeira Compra"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Estatística 1 - Valor</Label>
                  <Input
                    value={config.stat1Value}
                    onChange={(e) => handleChange("stat1Value", e.target.value)}
                    placeholder="Ex: 50+"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Estatística 1 - Label</Label>
                  <Input
                    value={config.stat1Label}
                    onChange={(e) => handleChange("stat1Label", e.target.value)}
                    placeholder="Ex: Peças Exclusivas"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Estatística 2 - Valor</Label>
                  <Input
                    value={config.stat2Value}
                    onChange={(e) => handleChange("stat2Value", e.target.value)}
                    placeholder="Ex: 24h"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Estatística 2 - Label</Label>
                  <Input
                    value={config.stat2Label}
                    onChange={(e) => handleChange("stat2Label", e.target.value)}
                    placeholder="Ex: Envio Express"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Estatística 3 - Valor</Label>
                  <Input
                    value={config.stat3Value}
                    onChange={(e) => handleChange("stat3Value", e.target.value)}
                    placeholder="Ex: 5k+"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Estatística 3 - Label</Label>
                  <Input
                    value={config.stat3Label}
                    onChange={(e) => handleChange("stat3Label", e.target.value)}
                    placeholder="Ex: Clientes Felizes"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
