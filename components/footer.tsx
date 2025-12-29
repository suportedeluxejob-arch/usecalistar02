import Link from "next/link"
import { Instagram, Facebook, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h4 className="text-2xl font-bold">usecalistar</h4>
            <p className="text-sm opacity-80 leading-relaxed">
              Biquínis exclusivos para mulheres que brilham. Cada peça conta uma história de elegância e liberdade.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h5 className="font-semibold uppercase tracking-wide text-sm">Loja</h5>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Novidades
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Biquínis
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Vestidos
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Acessórios
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h5 className="font-semibold uppercase tracking-wide text-sm">Informações</h5>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Entregas
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:opacity-100 transition-opacity">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h5 className="font-semibold uppercase tracking-wide text-sm">Contato</h5>
            <ul className="space-y-2 text-sm opacity-80">
              <li>contato@usecalistar.com.br</li>
              <li>(11) 99999-9999</li>
              <li>Segunda a Sexta, 9h às 18h</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm opacity-60">© 2025 usecalistar. Todos os direitos reservados.</p>
          <p className="text-sm opacity-60 flex items-center gap-1">
            Feito com <Heart className="w-4 h-4 text-primary fill-primary" /> no Brasil
          </p>
        </div>
      </div>
    </footer>
  )
}
