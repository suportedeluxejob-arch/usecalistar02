"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Store, Truck, CreditCard, Bell, Save } from "lucide-react"

export function AdminSettings() {
  const [settings, setSettings] = useState({
    storeName: "usecalistar",
    storeEmail: "contato@usecalistar.com",
    storePhone: "(11) 99999-9999",
    storeDescription: "Biquínis exclusivos para mulheres que amam o verão",
    freeShippingThreshold: 299,
    enableFreeShipping: true,
    pixEnabled: true,
    creditCardEnabled: true,
    boletoEnabled: false,
    lowStockAlert: 5,
    emailNotifications: true,
    whatsappNotifications: false,
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // TODO: Save to Firebase
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Store Info */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-rose-400" />
            <CardTitle className="text-zinc-100">Informações da Loja</CardTitle>
          </div>
          <CardDescription className="text-zinc-500">Dados básicos da sua loja</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storeName" className="text-zinc-300">
                Nome da Loja
              </Label>
              <Input
                id="storeName"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <Label htmlFor="storeEmail" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="storeEmail"
                type="email"
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <Label htmlFor="storePhone" className="text-zinc-300">
                Telefone/WhatsApp
              </Label>
              <Input
                id="storePhone"
                value={settings.storePhone}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="storeDescription" className="text-zinc-300">
              Descrição
            </Label>
            <Textarea
              id="storeDescription"
              value={settings.storeDescription}
              onChange={(e) => setSettings({ ...settings, storeDescription: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Shipping */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-zinc-100">Frete</CardTitle>
          </div>
          <CardDescription className="text-zinc-500">Configurações de entrega</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-100">Frete Grátis</p>
              <p className="text-xs text-zinc-500">Ativar frete grátis acima de um valor</p>
            </div>
            <Switch
              checked={settings.enableFreeShipping}
              onCheckedChange={(checked) => setSettings({ ...settings, enableFreeShipping: checked })}
            />
          </div>

          {settings.enableFreeShipping && (
            <div>
              <Label htmlFor="freeShippingThreshold" className="text-zinc-300">
                Valor mínimo para frete grátis (R$)
              </Label>
              <Input
                id="freeShippingThreshold"
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, freeShippingThreshold: Number.parseFloat(e.target.value) || 0 })
                }
                className="bg-zinc-800 border-zinc-700 text-zinc-100 w-48"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payments */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-zinc-100">Pagamentos</CardTitle>
          </div>
          <CardDescription className="text-zinc-500">Métodos de pagamento aceitos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-100">PIX</p>
              <p className="text-xs text-zinc-500">Pagamento instantâneo</p>
            </div>
            <Switch
              checked={settings.pixEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, pixEnabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-100">Cartão de Crédito</p>
              <p className="text-xs text-zinc-500">Parcelamento em até 12x</p>
            </div>
            <Switch
              checked={settings.creditCardEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, creditCardEnabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-100">Boleto</p>
              <p className="text-xs text-zinc-500">Vencimento em 3 dias</p>
            </div>
            <Switch
              checked={settings.boletoEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, boletoEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <CardTitle className="text-zinc-100">Notificações</CardTitle>
          </div>
          <CardDescription className="text-zinc-500">Alertas e avisos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="lowStockAlert" className="text-zinc-300">
              Alerta de estoque baixo (unidades)
            </Label>
            <Input
              id="lowStockAlert"
              type="number"
              value={settings.lowStockAlert}
              onChange={(e) => setSettings({ ...settings, lowStockAlert: Number.parseInt(e.target.value) || 0 })}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 w-32"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-100">Notificações por Email</p>
              <p className="text-xs text-zinc-500">Receber avisos de novas vendas</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-100">Notificações por WhatsApp</p>
              <p className="text-xs text-zinc-500">Receber alertas no WhatsApp</p>
            </div>
            <Switch
              checked={settings.whatsappNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, whatsappNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-rose-500 hover:bg-rose-600">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  )
}
