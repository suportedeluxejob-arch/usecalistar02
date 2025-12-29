"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingBag, Eye, ArrowUpRight, ArrowDownRight, Package } from "lucide-react"
import { subscribeToProducts, type Product } from "@/lib/firebase-products"
import { subscribeToSales, subscribeToActiveVisitors, type SaleRecord } from "@/lib/firebase-analytics"
import { formatCurrency } from "@/lib/utils"

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<SaleRecord[]>([])
  const [activeVisitors, setActiveVisitors] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubProducts = subscribeToProducts(setProducts)
    const unsubSales = subscribeToSales(setSales)
    const unsubVisitors = subscribeToActiveVisitors(setActiveVisitors)

    setLoading(false)

    return () => {
      unsubProducts()
      unsubSales()
      unsubVisitors()
    }
  }, [])

  const today = new Date().toISOString().split("T")[0]
  const todaySales = sales.filter((s) => new Date(s.createdAt).toISOString().split("T")[0] === today)

  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0)
  const todayRevenue = todaySales.reduce((acc, s) => acc + s.total, 0)
  const activeProducts = products.filter((p) => p.active).length
  const lowStockProducts = products.filter((p) => p.stock < 5).length

  const stats = [
    {
      title: "Receita Total",
      value: formatCurrency(totalRevenue),
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-400",
    },
    {
      title: "Vendas Hoje",
      value: todaySales.length.toString(),
      subValue: formatCurrency(todayRevenue),
      change: "+8.2%",
      trend: "up",
      icon: ShoppingBag,
      color: "bg-blue-500/10 text-blue-400",
    },
    {
      title: "Visitantes Ativos",
      value: activeVisitors.toString(),
      change: "agora",
      trend: "neutral",
      icon: Eye,
      color: "bg-purple-500/10 text-purple-400",
      pulse: activeVisitors > 0,
    },
    {
      title: "Produtos Ativos",
      value: activeProducts.toString(),
      subValue: lowStockProducts > 0 ? `${lowStockProducts} com estoque baixo` : undefined,
      change: products.length.toString() + " total",
      trend: "neutral",
      icon: Package,
      color: "bg-rose-500/10 text-rose-400",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                {stat.pulse && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm text-zinc-400">{stat.title}</p>
                <p className="text-2xl font-bold text-zinc-100 mt-1">{stat.value}</p>
                {stat.subValue && <p className="text-xs text-zinc-500 mt-1">{stat.subValue}</p>}
              </div>
              <div className="mt-2 flex items-center text-xs">
                {stat.trend === "up" && <ArrowUpRight className="w-3 h-3 text-emerald-400 mr-1" />}
                {stat.trend === "down" && <ArrowDownRight className="w-3 h-3 text-red-400 mr-1" />}
                <span
                  className={
                    stat.trend === "up" ? "text-emerald-400" : stat.trend === "down" ? "text-red-400" : "text-zinc-500"
                  }
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-lg">Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Nenhuma venda ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sales.slice(0, 5).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{sale.customerName}</p>
                      <p className="text-xs text-zinc-500">
                        {sale.products.length} {sale.products.length === 1 ? "item" : "itens"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emerald-400">{formatCurrency(sale.total)}</p>
                      <p className="text-xs text-zinc-500">{new Date(sale.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-lg">Alertas de Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Todos os produtos com estoque adequado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products
                  .filter((p) => p.stock < 5)
                  .slice(0, 5)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        {product.images[0] && (
                          <img
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-zinc-100">{product.name}</p>
                          <p className="text-xs text-zinc-500">{product.category}</p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-medium ${product.stock === 0 ? "text-red-400" : "text-amber-400"}`}
                      >
                        {product.stock === 0 ? "Esgotado" : `${product.stock} un.`}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
