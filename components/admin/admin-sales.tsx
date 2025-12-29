"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingBag, Package, Truck, CheckCircle, XCircle } from "lucide-react"
import { subscribeToSales, type SaleRecord } from "@/lib/firebase-analytics"
import { formatCurrency } from "@/lib/utils"

const statusConfig = {
  pending: { label: "Pendente", color: "bg-amber-500/10 text-amber-400", icon: ShoppingBag },
  paid: { label: "Pago", color: "bg-blue-500/10 text-blue-400", icon: Package },
  shipped: { label: "Enviado", color: "bg-purple-500/10 text-purple-400", icon: Truck },
  delivered: { label: "Entregue", color: "bg-emerald-500/10 text-emerald-400", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-400", icon: XCircle },
}

export function AdminSales() {
  const [sales, setSales] = useState<SaleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    const unsub = subscribeToSales((data) => {
      setSales(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const filteredSales = sales.filter((sale) => filterStatus === "all" || sale.status === filterStatus)

  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-400">Total de Vendas</p>
            <p className="text-2xl font-bold text-zinc-100">{filteredSales.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-400">Receita Total</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-400">Ticket Médio</p>
            <p className="text-2xl font-bold text-zinc-100">
              {filteredSales.length > 0 ? formatCurrency(totalRevenue / filteredSales.length) : "R$ 0,00"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-zinc-100">Pedidos</h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 bg-zinc-900 border-zinc-800 text-zinc-100">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all" className="text-zinc-100">
              Todos
            </SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key} className="text-zinc-100">
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sales List */}
      {filteredSales.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="w-12 h-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400">Nenhuma venda encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSales.map((sale) => {
            const status = statusConfig[sale.status]
            const StatusIcon = status.icon

            return (
              <Card key={sale.id} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${status.color}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-100">{sale.customerName}</p>
                        <p className="text-sm text-zinc-500">{sale.customerEmail}</p>
                        <p className="text-xs text-zinc-600 mt-1">
                          Pedido #{sale.orderId} • {new Date(sale.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge className={status.color}>{status.label}</Badge>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-400">{formatCurrency(sale.total)}</p>
                        <p className="text-xs text-zinc-500">
                          {sale.products.length} {sale.products.length === 1 ? "item" : "itens"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex flex-wrap gap-2">
                      {sale.products.map((product, idx) => (
                        <Badge key={idx} variant="outline" className="border-zinc-700 text-zinc-400">
                          {product.quantity}x {product.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
