import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { Loader2 } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Checkout | usecalistar",
  description: "Finalize sua compra com segurança via PIX",
}

function CheckoutLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-2">Checkout</h1>
          <p className="text-center text-muted-foreground mb-10">Preencha seus dados para finalizar a compra</p>
          <Suspense fallback={<CheckoutLoading />}>
            <CheckoutForm />
          </Suspense>
        </div>
      </div>
      <Footer />
    </main>
  )
}
