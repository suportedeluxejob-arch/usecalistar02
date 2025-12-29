import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export const metadata = {
  title: "Checkout | usecalistar",
  description: "Finalize sua compra com segurança via PIX",
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-2">Checkout</h1>
          <p className="text-center text-muted-foreground mb-10">Preencha seus dados para finalizar a compra</p>
          <CheckoutForm />
        </div>
      </div>
      <Footer />
    </main>
  )
}
