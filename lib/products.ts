export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  hoverImage?: string
  images?: string[]
  category: "conjuntos" | "tops" | "calcinhas"
  isNew?: boolean
  isSale?: boolean
  sizes?: string[]
  colors?: { name: string; hex: string }[]
  description?: string
  details?: string[]
  material?: string
  careInstructions?: string[]
}

export const products: Product[] = [
  // CALCINHAS - Only 1 product
  {
    id: "calcinha-rose",
    name: "Calcinha ROSE",
    price: 39.9,
    originalPrice: 59.9,
    image: "https://iili.io/fV5HZGe.jpg",
    images: ["https://iili.io/fV5HZGe.jpg"],
    category: "calcinhas",
    isNew: true,
    isSale: true,
    sizes: ["PP", "P", "M"],
    colors: [{ name: "Rosa", hex: "#E91E8C" }],
    description: "Calcinha modelo rose com estampa animal print em rosa vibrante. Design delicado e confortável.",
    details: [
      "Modelo rose com corte valorizado",
      "Estampa animal print exclusiva",
      "Forro em algodão",
      "Costuras planas para maior conforto",
    ],
    material: "82% Poliamida, 18% Elastano",
    careInstructions: ["Lavar à mão com água fria", "Não usar alvejante", "Secar à sombra"],
  },

  // TOPS - Only 1 product
  {
    id: "top-lins",
    name: "Top Lins",
    price: 49.89,
    originalPrice: 76.0,
    image: "https://iili.io/fVRgK4n.jpg",
    images: ["https://iili.io/fVRgK4n.jpg"],
    category: "tops",
    isNew: true,
    isSale: true,
    sizes: ["P", "M", "PP", "G"],
    colors: [{ name: "Azul Serenity", hex: "#9BB8D3" }],
    description:
      "Top triângulo clássico modelo Lins em azul serenity. Perfeito para combinar com diferentes calcinhas e criar looks únicos.",
    details: ["Modelo triângulo clássico", "Tiras ajustáveis", "Bojo removível", "Forro em algodão"],
    material: "80% Poliamida, 20% Elastano",
    careInstructions: ["Lavar à mão com água fria", "Não usar alvejante", "Secar à sombra"],
  },

  // CONJUNTOS - Multiple products with real prices
  {
    id: "bitily-rose",
    name: "Bitily Rose",
    price: 89.9,
    originalPrice: 100,
    image: "https://iili.io/fVR0Pxp.jpg",
    images: ["https://iili.io/fVR0Pxp.jpg"],
    category: "conjuntos",
    isNew: true,
    isSale: true,
    sizes: ["PP", "G", "M", "GG"],
    colors: [{ name: "Animal Print", hex: "#C4A77D" }],
    description: "Conjunto Bitily Rose com estampa animal print exclusiva. Modelo elegante e confortável para o verão.",
    details: [
      "Top modelo cortininha",
      "Calcinha com lateral ajustável",
      "Estampa animal print exclusiva",
      "Forro duplo para maior conforto",
    ],
    material: "82% Poliamida, 18% Elastano",
    careInstructions: ["Lavar à mão com água fria", "Não usar alvejante", "Secar à sombra", "Não passar a ferro"],
  },
]

export const categories = [
  { id: "all", name: "Todos" },
  { id: "conjuntos", name: "Conjuntos" },
  { id: "tops", name: "Tops" },
  { id: "calcinhas", name: "Calcinhas" },
]

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, limit)
}
