import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartDrawer } from "@/components/cart-drawer"
import { CategoryProducts } from "@/components/category-products"
import { CategoryHeroBanner } from "@/components/category-hero-banner"
import { notFound } from "next/navigation"

const validCategories = ["conjuntos", "tops", "calcinhas"]

const titles: Record<string, string> = {
  conjuntos: "Conjuntos",
  tops: "Tops",
  calcinhas: "Calcinhas",
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params

  if (!validCategories.includes(slug)) {
    return { title: "Categoria não encontrada" }
  }

  return {
    title: `${titles[slug]} | usecalistar`,
    description: `Confira nossa coleção de ${titles[slug].toLowerCase()}`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params

  if (!validCategories.includes(slug)) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Banner */}
      <CategoryHeroBanner slug={slug as "conjuntos" | "tops" | "calcinhas"} />

      {/* Products */}
      <CategoryProducts categorySlug={slug} categoryTitle={slug.charAt(0).toUpperCase() + slug.slice(1)} />

      <Footer />
      <CartDrawer />
    </main>
  )
}
