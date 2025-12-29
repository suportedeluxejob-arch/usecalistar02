"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Heart, Gift } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full text-sm">
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <span className="text-secondary-foreground">Junte-se à família usecalistar</span>
          </div>

          <h3 className="text-4xl md:text-5xl font-bold text-foreground">
            Receba Novidades
            <span className="block text-primary italic">em Primeira Mão</span>
          </h3>

          <p className="text-muted-foreground max-w-md mx-auto">
            Seja a primeira a saber sobre lançamentos exclusivos, promoções especiais e dicas de estilo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-full px-6 h-14 bg-card border-border"
            />
            <Button size="lg" className="rounded-full px-8 h-14">
              <Sparkles className="w-4 h-4 mr-2" />
              Inscrever
            </Button>
          </div>

          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            Ganhe 15% OFF na primeira compra ao se inscrever
            <Gift className="w-3 h-3 text-primary" />
          </p>
        </div>
      </div>
    </section>
  )
}
