import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartDrawer } from "@/components/cart-drawer"
import { StorytellingSection } from "@/components/storytelling-section"
import { BackstageGallery } from "@/components/backstage-gallery"
import { Heart, Instagram, MessageCircle } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Nossa História | Conheça a Isa",
  description:
    "Conheça a história por trás da nossa marca. Uma jornada de dedicação, amor e muito trabalho para entregar o melhor para você.",
}

export default function NossaHistoriaPage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Full Storytelling */}
      <div className="pt-24">
        <StorytellingSection />
      </div>

      {/* Personal Gallery */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-[#2D2D2D] mb-4">Bastidores</h2>
            <p className="text-[#6B6B6B] max-w-xl mx-auto">
              Um pouquinho do dia a dia, das madrugadas embalando pedidos, e de toda a dedicação que coloco em cada
              envio.
            </p>
          </div>

          <BackstageGallery />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#FDF8F6]">
        <div className="container mx-auto px-4 text-center">
          <Heart className="w-12 h-12 text-[#C9A87C] mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-serif text-[#2D2D2D] mb-6">Vamos Nos Conectar?</h2>
          <p className="text-[#6B6B6B] max-w-xl mx-auto mb-8">
            Me siga nas redes sociais para acompanhar novidades, bastidores e promoções exclusivas. Adoro conhecer cada
            uma de vocês!
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="#"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-5 h-5" />
              Instagram
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <CartDrawer />
    </main>
  )
}
