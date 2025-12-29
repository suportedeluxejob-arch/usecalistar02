import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PaymentStatus } from "@/components/checkout/payment-status"

export const metadata = {
  title: "Pagamento PIX | usecalistar",
  description: "Finalize seu pagamento via PIX",
}

export default function PaymentPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-32 pb-20">
        <PaymentStatus />
      </div>
      <Footer />
    </main>
  )
}
