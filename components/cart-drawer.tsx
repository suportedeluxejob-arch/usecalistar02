"use client"

import Link from "next/link"
import { X, Minus, Plus, ShoppingBag, Trash2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalItems, totalPrice } = useCart()

  if (!isOpen) return null

  const freeShippingThreshold = 299
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice)
  const hasFreeShipping = totalPrice >= freeShippingThreshold

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={closeCart} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Sacola</h2>
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">{totalItems}</span>
          </div>
          <button
            onClick={closeCart}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {!hasFreeShipping && totalItems > 0 && (
          <div className="px-6 py-4 bg-secondary/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>
                Faltam{" "}
                <strong className="text-foreground">R$ {remainingForFreeShipping.toLocaleString("pt-BR")}</strong> para
                frete grátis!
              </span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalPrice / freeShippingThreshold) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {hasFreeShipping && totalItems > 0 && (
          <div className="px-6 py-3 bg-primary/10 text-center">
            <span className="text-sm text-primary font-medium flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Parabéns! Você ganhou frete grátis!
            </span>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: "calc(100vh - 350px)" }}>
          {items.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 mx-auto bg-secondary rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Sua sacola está vazia</p>
              <Button variant="outline" className="rounded-full bg-transparent" onClick={closeCart}>
                Continuar Comprando
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.product.id}-${item.size}-${item.color}`}
                className="flex gap-4 bg-secondary/30 rounded-2xl p-4"
              >
                <div className="w-20 h-24 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                  <img
                    src={item.product.image || "/placeholder.svg"}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{item.product.name}</h4>
                  <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                    {item.size && <span>Tam: {item.size}</span>}
                    {item.color && <span>Cor: {item.color}</span>}
                  </div>
                  <div className="font-bold text-foreground mt-1">
                    R$ {(item.product.price * item.quantity).toLocaleString("pt-BR")}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-card rounded-full">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer - Updated to link to checkout page */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4 bg-card">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">R$ {totalPrice.toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frete</span>
                <span className={hasFreeShipping ? "text-primary" : "text-foreground"}>
                  {hasFreeShipping ? "Grátis" : "Calcular no checkout"}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">R$ {totalPrice.toLocaleString("pt-BR")}</span>
              </div>
            </div>

            <Link href="/checkout" onClick={closeCart}>
              <Button size="lg" className="w-full rounded-full">
                Finalizar Compra
              </Button>
            </Link>

            <p className="text-xs text-center text-muted-foreground">Pagamento seguro via PIX</p>
          </div>
        )}
      </div>
    </div>
  )
}
