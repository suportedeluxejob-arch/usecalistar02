"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ShoppingBag, MapPin, User, CreditCard } from "lucide-react"

interface FormData {
  fullName: string
  document: string
  email: string
  phone: string
  zipCode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

export function CheckoutForm() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    document: "",
    email: "",
    phone: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  })

  const freeShippingThreshold = 299
  const shippingCost = totalPrice >= freeShippingThreshold ? 0 : 19.9
  const finalTotal = totalPrice + shippingCost

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Format CPF/CNPJ
  const formatDocument = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    }
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
  }

  // Format phone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1")
  }

  // Format CEP
  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9)
  }

  // Fetch address from CEP
  const fetchAddress = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "")
    if (cleanCep.length !== 8) return

    setIsLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        }))
      }
    } catch {
      console.error("Erro ao buscar CEP")
    } finally {
      setIsLoadingCep(false)
    }
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value)
    setFormData((prev) => ({ ...prev, document: formatted }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData((prev) => ({ ...prev, phone: formatted }))
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value)
    setFormData((prev) => ({ ...prev, zipCode: formatted }))
    if (formatted.replace(/\D/g, "").length === 8) {
      fetchAddress(formatted)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Create order description
      const orderDescription = items.map((item) => `${item.quantity}x ${item.product.name}`).join(", ")

      const response = await fetch("/api/pagou/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: finalTotal,
          description: `Pedido usecalistar: ${orderDescription}`,
          payer: {
            fullName: formData.fullName,
            document: formData.document.replace(/\D/g, ""),
            phone: `+55${formData.phone.replace(/\D/g, "")}`,
            email: formData.email,
            address: {
              zipCode: formData.zipCode.replace(/\D/g, ""),
              street: formData.street,
              neighborhood: formData.neighborhood,
              number: formData.number,
              complement: formData.complement,
              city: formData.city,
              state: formData.state,
              country: "BR",
            },
          },
          items: items.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            size: item.size,
            color: item.color,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar pagamento")
      }

      // Store payment data in sessionStorage for the payment page
      sessionStorage.setItem(
        "paymentData",
        JSON.stringify({
          transactionId: data.transactionId,
          pixQrCode: data.pixQrCode,
          pixCode: data.pixCode,
          value: finalTotal,
          expirationDate: data.expirationDate,
        }),
      )

      // Navigate to payment page
      router.push(`/checkout/pagamento?id=${data.transactionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar pagamento")
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-20 h-20 mx-auto bg-secondary rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Seu carrinho está vazio</h2>
        <p className="text-muted-foreground mb-6">Adicione produtos ao carrinho para continuar</p>
        <Button onClick={() => router.push("/")} className="rounded-full">
          Ver Produtos
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-10">
      {/* Form Section */}
      <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8">
        {/* Personal Info */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Dados Pessoais</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Seu nome completo"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="document">CPF *</Label>
              <Input
                id="document"
                name="document"
                value={formData.document}
                onChange={handleDocumentChange}
                placeholder="000.000.000-00"
                required
                maxLength={18}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                required
                maxLength={15}
                className="mt-1.5"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Endereço de Entrega</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="zipCode">CEP *</Label>
              <div className="relative">
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleCepChange}
                  placeholder="00000-000"
                  required
                  maxLength={9}
                  className="mt-1.5"
                />
                {isLoadingCep && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="street">Rua *</Label>
              <Input
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Nome da rua"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                name="number"
                value={formData.number}
                onChange={handleChange}
                placeholder="123"
                required
                className="mt-1.5"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                name="complement"
                value={formData.complement}
                onChange={handleChange}
                placeholder="Apto, Bloco, etc."
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                placeholder="Seu bairro"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Sua cidade"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="UF"
                required
                maxLength={2}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Forma de Pagamento</h2>
          </div>

          <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl border-2 border-primary">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 512 512" className="w-7 h-7 text-primary" fill="currentColor">
                <path d="M242.4 292.5C247.8 287.1 257.1 287.1 262.5 292.5L339.5 369.5C353.7 383.7 googletag.cmd.push(function() {googletag.display('div-gpt-ad-1541767382498-4');});344.9 googletag.cmd.push(function() {googletag.display('div-gpt-ad-1541767382498-4');});407.1 googletag.cmd.push(function() {googletag.display('div-gpt-ad-1541767382498-4');});330.9 407.1C316.7 421.3 294.3 421.3 280.1 407.1L242.4 369.5C237 364.1 237 354.8 242.4 349.5L269.9 322H192C174.3 322 160 307.7 160 290V222C160 204.3 174.3 190 192 190H320C337.7 190 352 204.3 352 222V290C352 307.7 337.7 322 320 322H294.1L262.5 292.5C257.1 287.1 247.8 287.1 242.4 292.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">PIX</h3>
              <p className="text-sm text-muted-foreground">Pagamento instantâneo e seguro</p>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            </div>
          </div>
        </div>

        {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>}

        <Button type="submit" size="lg" className="w-full rounded-full text-lg h-14" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            `Pagar R$ ${finalTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
          )}
        </Button>
      </form>

      {/* Order Summary */}
      <div className="lg:col-span-2">
        <div className="bg-card rounded-2xl p-6 border border-border sticky top-32">
          <h2 className="text-lg font-semibold text-foreground mb-6">Resumo do Pedido</h2>

          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4">
                <div className="w-16 h-20 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                  <img
                    src={item.product.image || "/placeholder.svg"}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm truncate">{item.product.name}</h4>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {item.size && <span>Tam: {item.size}</span>}
                    {item.size && item.color && <span> | </span>}
                    {item.color && <span>Cor: {item.color}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">Qtd: {item.quantity}</div>
                  <div className="font-semibold text-foreground text-sm mt-1">
                    R$ {(item.product.price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">
                R$ {totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frete</span>
              <span className={shippingCost === 0 ? "text-primary font-medium" : "text-foreground"}>
                {shippingCost === 0
                  ? "Grátis"
                  : `R$ ${shippingCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">
                R$ {finalTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg
                className="w-4 h-4 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Pagamento 100% seguro via PIX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
