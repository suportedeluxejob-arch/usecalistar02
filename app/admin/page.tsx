"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Plus,
  Menu,
  X,
  LogOut,
  Store,
  Sparkles,
  ImageIcon,
  Layers,
  BookOpen,
  Tags,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminProducts } from "@/components/admin/admin-products"
import { AdminSales } from "@/components/admin/admin-sales"
import { AdminSettings } from "@/components/admin/admin-settings"
import { AdminShopTheLook } from "@/components/admin/admin-shop-the-look"
import { AdminHero } from "@/components/admin/admin-hero"
import { AdminRecommendations } from "@/components/admin/admin-recommendations"
import { AdminStorytelling } from "@/components/admin/admin-storytelling"
import { AdminCategoryBanners } from "@/components/admin/admin-category-banners"

type Tab =
  | "dashboard"
  | "products"
  | "sales"
  | "settings"
  | "shopthelook"
  | "hero"
  | "recommendations"
  | "storytelling"
  | "categories"

const navigation = [
  { id: "dashboard" as Tab, name: "Dashboard", icon: LayoutDashboard },
  { id: "products" as Tab, name: "Produtos", icon: Package },
  { id: "hero" as Tab, name: "Hero (Capa)", icon: ImageIcon },
  { id: "categories" as Tab, name: "Categorias", icon: Tags },
  { id: "storytelling" as Tab, name: "Nossa História", icon: BookOpen },
  { id: "shopthelook" as Tab, name: "Shop the Look", icon: Sparkles },
  { id: "recommendations" as Tab, name: "Recomendações", icon: Layers },
  { id: "sales" as Tab, name: "Vendas", icon: ShoppingCart },
  { id: "settings" as Tab, name: "Configurações", icon: Settings },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">usecalistar</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-zinc-800 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === item.id
                  ? "bg-rose-500/10 text-rose-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
          <Link href="/">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-transparent border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <LogOut className="w-4 h-4" />
              Voltar para Loja
            </Button>
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-zinc-800 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-semibold capitalize hidden lg:block">
            {navigation.find((n) => n.id === activeTab)?.name}
          </h1>

          <div className="flex items-center gap-3">
            {activeTab === "products" && (
              <Button
                onClick={() => {
                  const event = new CustomEvent("openProductModal")
                  window.dispatchEvent(event)
                }}
                className="bg-rose-500 hover:bg-rose-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            )}
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "products" && <AdminProducts />}
          {activeTab === "hero" && <AdminHero />}
          {activeTab === "categories" && <AdminCategoryBanners />}
          {activeTab === "storytelling" && <AdminStorytelling />}
          {activeTab === "shopthelook" && <AdminShopTheLook />}
          {activeTab === "recommendations" && <AdminRecommendations />}
          {activeTab === "sales" && <AdminSales />}
          {activeTab === "settings" && <AdminSettings />}
        </main>
      </div>
    </div>
  )
}
