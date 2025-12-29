"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { Copy, Check, Clock, CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react"

interface PaymentData {
  transactionId: string
  pixQrCode: string
  pixCode: string
  value: number
  expirationDate: string
}

type PaymentStatusType = "WAITING_PAYMENT" | "PAID" | "ERROR" | "EXPIRED" | "LOADING"

export function PaymentStatus() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const transactionId = searchParams.get("id")

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [status, setStatus] = useState<PaymentStatusType>("LOADING")
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>("")

  // Load payment data from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("paymentData")
    if (stored) {
      const data = JSON.parse(stored) as PaymentData
      setPaymentData(data)
      setStatus("WAITING_PAYMENT")
    } else if (transactionId) {
      // If no sessionStorage data, try to fetch from API
      checkPaymentStatus()
    } else {
      router.push("/checkout")
    }
  }, [transactionId])

  // Check payment status periodically
  const checkPaymentStatus = useCallback(async () => {
    if (!transactionId) return

    try {
      const response = await fetch(`/api/pagou/check-status?id=${transactionId}`)
      const data = await response.json()

      if (data.status === "PAID") {
        setStatus("PAID")
        clearCart()
        sessionStorage.removeItem("paymentData")
      } else if (data.status === "ERROR") {
        setStatus("ERROR")
      } else if (data.status === "EXPIRED") {
        setStatus("EXPIRED")
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
    }
  }, [transactionId, clearCart])

  // Poll for payment status every 5 seconds
  useEffect(() => {
    if (status !== "WAITING_PAYMENT") return

    const interval = setInterval(checkPaymentStatus, 5000)
    return () => clearInterval(interval)
  }, [status, checkPaymentStatus])

  // Countdown timer
  useEffect(() => {
    if (!paymentData?.expirationDate || status !== "WAITING_PAYMENT") return

    const updateTimer = () => {
      const now = new Date().getTime()
      const expiration = new Date(paymentData.expirationDate).getTime()
      const diff = expiration - now

      if (diff <= 0) {
        setTimeLeft("Expirado")
        setStatus("EXPIRED")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [paymentData?.expirationDate, status])

  const copyPixCode = async () => {
    if (!paymentData?.pixCode) return

    try {
      await navigator.clipboard.writeText(paymentData.pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  if (status === "LOADING") {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando pagamento...</p>
        </div>
      </div>
    )
  }

  if (status === "PAID") {
    return (
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-14 h-14 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Pagamento Confirmado!</h1>
          <p className="text-muted-foreground mb-8">
            Seu pedido foi recebido com sucesso. Você receberá um e-mail com os detalhes da compra e informações de
            envio.
          </p>
          <div className="bg-card rounded-2xl p-6 border border-border mb-8">
            <p className="text-sm text-muted-foreground mb-1">Código do pedido</p>
            <p className="font-mono text-lg font-semibold text-foreground">
              {transactionId?.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <Button onClick={() => router.push("/")} size="lg" className="rounded-full">
            Voltar à Loja
          </Button>
        </div>
      </div>
    )
  }

  if (status === "ERROR" || status === "EXPIRED") {
    return (
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-14 h-14 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            {status === "EXPIRED" ? "Pagamento Expirado" : "Erro no Pagamento"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {status === "EXPIRED"
              ? "O tempo para realizar o pagamento expirou. Por favor, tente novamente."
              : "Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push("/")} className="rounded-full">
              Voltar à Loja
            </Button>
            <Button onClick={() => router.push("/checkout")} className="rounded-full">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Pagamento via PIX</h1>
          <p className="text-muted-foreground">Escaneie o QR Code ou copie o código para pagar</p>
        </div>

        <div className="bg-card rounded-2xl p-8 border border-border">
          {/* Timer */}
          <div className="flex items-center justify-center gap-2 mb-6 text-muted-foreground">
            <Clock className="w-5 h-5" />
            <span>Expira em:</span>
            <span className="font-mono font-semibold text-foreground">{timeLeft}</span>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="bg-card p-4 rounded-xl border border-border">
              {paymentData?.pixQrCode && (
                <img src={paymentData.pixQrCode || "/placeholder.svg"} alt="QR Code PIX" className="w-64 h-64" />
              )}
            </div>
          </div>

          {/* Value */}
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-1">Valor a pagar</p>
            <p className="text-3xl font-bold text-foreground">
              R$ {paymentData?.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Copy Code */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">Ou copie o código PIX Copia e Cola:</p>
            <div className="relative">
              <div className="bg-secondary rounded-xl p-4 pr-24 break-all text-sm font-mono text-foreground max-h-24 overflow-y-auto">
                {paymentData?.pixCode}
              </div>
              <Button onClick={copyPixCode} size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4 text-center">Como pagar via PIX</h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  1
                </span>
                Abra o app do seu banco ou carteira digital
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  2
                </span>
                Escolha pagar via PIX com QR Code ou Copia e Cola
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  3
                </span>
                Escaneie o código ou cole o código copiado
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  4
                </span>
                Confirme o pagamento e aguarde a confirmação
              </li>
            </ol>
          </div>

          {/* Refresh Button */}
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={checkPaymentStatus} className="text-muted-foreground">
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar pagamento
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
