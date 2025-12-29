"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Loader2, Quote, Clock, BarChart3, Heart, Plus, Trash2, GripVertical, ImageIcon } from "lucide-react"
import {
  subscribeToStorytellingConfig,
  updateStorytellingConfig,
  type StorytellingConfig,
  type TimelineItem,
} from "@/lib/firebase-store-config"
import { AdminBackstage } from "./admin-backstage"

export function AdminStorytelling() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState<StorytellingConfig | null>(null)

  useEffect(() => {
    const unsub = subscribeToStorytellingConfig((data) => {
      setConfig(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const saveConfig = async () => {
    if (!config) return
    setSaving(true)
    try {
      await updateStorytellingConfig(config)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error("Error saving storytelling config:", e)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof StorytellingConfig, value: any) => {
    if (!config) return
    setConfig((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const updateTimelineItem = (index: number, field: keyof TimelineItem, value: string) => {
    if (!config) return
    const newItems = [...config.timelineItems]
    newItems[index] = { ...newItems[index], [field]: value }
    handleChange("timelineItems", newItems)
  }

  const addTimelineItem = () => {
    if (!config) return
    const newItem: TimelineItem = {
      id: Date.now().toString(),
      year: new Date().getFullYear().toString(),
      title: "Novo Marco",
      description: "Descreva este momento especial da jornada...",
      image: "",
      highlight: "Conquista",
      order: config.timelineItems.length,
    }
    handleChange("timelineItems", [...config.timelineItems, newItem])
  }

  const removeTimelineItem = (index: number) => {
    if (!config) return
    const newItems = config.timelineItems.filter((_, i) => i !== index)
    handleChange("timelineItems", newItems)
  }

  const updateStat = (index: number, field: "number" | "label", value: string) => {
    if (!config) return
    const newStats = [...config.stats]
    newStats[index] = { ...newStats[index], [field]: value }
    handleChange("stats", newStats)
  }

  const updateValue = (index: number, field: "title" | "description", value: string) => {
    if (!config) return
    const newValues = [...config.values]
    newValues[index] = { ...newValues[index], [field]: value }
    handleChange("values", newValues)
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
          <h2 className="text-xl font-semibold text-zinc-100">Seção Nossa História</h2>
          <p className="text-sm text-zinc-400">Gerencie o storytelling e a história da marca</p>
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

      <Tabs defaultValue="header" className="space-y-6">
        <TabsList className="bg-zinc-800 border-zinc-700">
          <TabsTrigger value="header" className="data-[state=active]:bg-rose-500">
            Cabeçalho
          </TabsTrigger>
          <TabsTrigger value="quote" className="data-[state=active]:bg-rose-500">
            Citação
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-rose-500">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-rose-500">
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="values" className="data-[state=active]:bg-rose-500">
            Valores
          </TabsTrigger>
          <TabsTrigger value="backstage" className="data-[state=active]:bg-rose-500">
            <ImageIcon className="w-4 h-4 mr-1" />
            Bastidores
          </TabsTrigger>
        </TabsList>

        {/* Header Tab */}
        <TabsContent value="header">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-lg">Cabeçalho da Seção</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-zinc-300">Título da Seção</Label>
                <Input
                  value={config.sectionTitle}
                  onChange={(e) => handleChange("sectionTitle", e.target.value)}
                  placeholder="Ex: Nossa História"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Subtítulo/Descrição</Label>
                <Textarea
                  value={config.sectionSubtitle}
                  onChange={(e) => handleChange("sectionSubtitle", e.target.value)}
                  placeholder="Descrição da seção..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quote Tab */}
        <TabsContent value="quote">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
                <Quote className="w-5 h-5" />
                Citação da Fundadora
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-zinc-300">Citação</Label>
                <Textarea
                  value={config.quote}
                  onChange={(e) => handleChange("quote", e.target.value)}
                  placeholder="A citação inspiradora..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[120px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Nome da Fundadora</Label>
                  <Input
                    value={config.founderName}
                    onChange={(e) => handleChange("founderName", e.target.value)}
                    placeholder="Ex: Isabella"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Cargo/Título</Label>
                  <Input
                    value={config.founderTitle}
                    onChange={(e) => handleChange("founderTitle", e.target.value)}
                    placeholder="Ex: Fundadora & CEO"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-zinc-300">Foto da Fundadora (URL)</Label>
                <Input
                  value={config.founderImage}
                  onChange={(e) => handleChange("founderImage", e.target.value)}
                  placeholder="URL da foto..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                />
                {config.founderImage && (
                  <div className="mt-2 w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-700">
                    <img
                      src={config.founderImage || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <div className="space-y-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timeline da Jornada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label className="text-zinc-300">Título da Timeline</Label>
                  <Input
                    value={config.timelineTitle}
                    onChange={(e) => handleChange("timelineTitle", e.target.value)}
                    placeholder="Ex: Minha Jornada"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {config.timelineItems.map((item, index) => (
              <Card key={item.id} className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
                      <GripVertical className="w-5 h-5 text-zinc-500" />
                      {item.year} - {item.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTimelineItem(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-zinc-300">Ano</Label>
                      <Input
                        value={item.year}
                        onChange={(e) => updateTimelineItem(index, "year", e.target.value)}
                        placeholder="Ex: 2021"
                        className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Título</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => updateTimelineItem(index, "title", e.target.value)}
                        placeholder="Ex: O Começo do Sonho"
                        className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-zinc-300">Descrição</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateTimelineItem(index, "description", e.target.value)}
                      placeholder="Descrição deste momento..."
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[80px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-zinc-300">Destaque/Conquista</Label>
                      <Input
                        value={item.highlight}
                        onChange={(e) => updateTimelineItem(index, "highlight", e.target.value)}
                        placeholder="Ex: Primeiro pedido enviado"
                        className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Imagem (URL)</Label>
                      <Input
                        value={item.image}
                        onChange={(e) => updateTimelineItem(index, "image", e.target.value)}
                        placeholder="URL da imagem..."
                        className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                      />
                    </div>
                  </div>
                  {item.image && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border border-zinc-700">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button
              onClick={addTimelineItem}
              variant="outline"
              className="w-full border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 bg-transparent"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Marco na Timeline
            </Button>
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {config.stats.map((stat, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 p-4 bg-zinc-800/50 rounded-lg">
                  <div>
                    <Label className="text-zinc-300">Valor</Label>
                    <Input
                      value={stat.number}
                      onChange={(e) => updateStat(index, "number", e.target.value)}
                      placeholder="Ex: 5.000+"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Label</Label>
                    <Input
                      value={stat.label}
                      onChange={(e) => updateStat(index, "label", e.target.value)}
                      placeholder="Ex: Clientes Felizes"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Values Tab */}
        <TabsContent value="values">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Valores da Marca
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {config.values.map((value, index) => (
                <div key={value.id} className="p-4 bg-zinc-800/50 rounded-lg space-y-4">
                  <div>
                    <Label className="text-zinc-300">Título</Label>
                    <Input
                      value={value.title}
                      onChange={(e) => updateValue(index, "title", e.target.value)}
                      placeholder="Ex: Feito com Amor"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Descrição</Label>
                    <Textarea
                      value={value.description}
                      onChange={(e) => updateValue(index, "description", e.target.value)}
                      placeholder="Descrição do valor..."
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[80px]"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backstage Tab */}
        <TabsContent value="backstage">
          <AdminBackstage />
        </TabsContent>
      </Tabs>
    </div>
  )
}
