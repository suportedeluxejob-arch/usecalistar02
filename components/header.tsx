"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingBag, Heart, Menu, X, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { totalItems, openCart } = useCart()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm tracking-wider">
        <span className="font-light">FRETE GRÁTIS</span> em compras acima de R$299
      </div>

      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex-1 lg:flex-none text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">usecalistar</h1>
            <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Bikini Collection</span>
          </Link>

          {/* Desktop Navigation - Updated links to category pages */}
          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            <Link
              href="/#novidades"
              className="text-sm tracking-wide hover:text-primary transition-colors uppercase font-medium"
            >
              Novidades
            </Link>
            <Link
              href="/categoria/conjuntos"
              className="text-sm tracking-wide hover:text-primary transition-colors uppercase font-medium"
            >
              Conjuntos
            </Link>
            <Link
              href="/categoria/tops"
              className="text-sm tracking-wide hover:text-primary transition-colors uppercase font-medium"
            >
              Tops
            </Link>
            <Link
              href="/categoria/calcinhas"
              className="text-sm tracking-wide hover:text-primary transition-colors uppercase font-medium"
            >
              Calcinhas
            </Link>
            <Link
              href="/nossa-historia"
              className="text-sm tracking-wide hover:text-primary transition-colors uppercase font-medium"
            >
              Nossa História
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </Button>
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu - Updated links to category pages */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4 space-y-4">
            <Link
              href="/#novidades"
              className="block text-center py-2 text-sm tracking-wide hover:text-primary transition-colors uppercase"
              onClick={() => setIsMenuOpen(false)}
            >
              Novidades
            </Link>
            <Link
              href="/categoria/conjuntos"
              className="block text-center py-2 text-sm tracking-wide hover:text-primary transition-colors uppercase"
              onClick={() => setIsMenuOpen(false)}
            >
              Conjuntos
            </Link>
            <Link
              href="/categoria/tops"
              className="block text-center py-2 text-sm tracking-wide hover:text-primary transition-colors uppercase"
              onClick={() => setIsMenuOpen(false)}
            >
              Tops
            </Link>
            <Link
              href="/categoria/calcinhas"
              className="block text-center py-2 text-sm tracking-wide hover:text-primary transition-colors uppercase"
              onClick={() => setIsMenuOpen(false)}
            >
              Calcinhas
            </Link>
            <Link
              href="/nossa-historia"
              className="block text-center py-2 text-sm tracking-wide hover:text-primary transition-colors uppercase"
              onClick={() => setIsMenuOpen(false)}
            >
              Nossa História
            </Link>
            <Link
              href="/admin"
              className="block text-center py-2 text-sm tracking-wide text-muted-foreground hover:text-primary transition-colors uppercase"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
