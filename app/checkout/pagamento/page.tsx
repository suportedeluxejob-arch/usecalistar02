import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PaymentStatus } from "@/components/checkout/payment-status"
import { Loader2 } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Pagamento PIX | usecalistar",
  description: "Finalize seu pagamento via PIX",
}

function PaymentLoading() {
  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando pagamento...</p>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-32 pb-20">
        <Suspense fallback={<PaymentLoading />}>
          <PaymentStatus />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}
