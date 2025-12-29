import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { ShopTheLook } from "@/components/shop-the-look"
import { ProductsSection } from "@/components/products-section"
import { StorytellingSection } from "@/components/storytelling-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { Footer } from "@/components/footer"
import { CartDrawer } from "@/components/cart-drawer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <CategoriesSection />
      <ShopTheLook />
      <ProductsSection />
      <StorytellingSection />
      <NewsletterSection />
      <Footer />
      <CartDrawer />
    </main>
  )
}
