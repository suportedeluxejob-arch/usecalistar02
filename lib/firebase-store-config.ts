import { database, ref, set, get, update, onValue, off } from "./firebase"

// ============================================
// PRODUCT HOTSPOTS (por produto)
// ============================================

export interface ProductHotspot {
  id: string
  productId: string // produto que o hotspot aponta
  label: string
  imageIndex: number // qual imagem do produto (0, 1, 2, etc)
  position: { x: number; y: number }
}

export interface ProductHotspotsConfig {
  [productId: string]: ProductHotspot[]
}

// Get hotspots for a specific product
export async function getProductHotspots(productId: string): Promise<ProductHotspot[]> {
  const hotspotsRef = ref(database, `storeConfig/productHotspots/${productId}`)
  const snapshot = await get(hotspotsRef)

  if (!snapshot.exists()) return []

  const data = snapshot.val()
  // Convert object to array if needed
  if (Array.isArray(data)) return data
  return Object.values(data) as ProductHotspot[]
}

// Update hotspots for a specific product
export async function updateProductHotspots(productId: string, hotspots: ProductHotspot[]): Promise<void> {
  const hotspotsRef = ref(database, `storeConfig/productHotspots/${productId}`)
  await set(hotspotsRef, hotspots)
}

// Subscribe to hotspots for a specific product
export function subscribeToProductHotspots(
  productId: string,
  callback: (hotspots: ProductHotspot[]) => void,
): () => void {
  const hotspotsRef = ref(database, `storeConfig/productHotspots/${productId}`)

  const listener = onValue(hotspotsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([])
      return
    }
    const data = snapshot.val()
    if (Array.isArray(data)) {
      callback(data)
    } else {
      callback(Object.values(data) as ProductHotspot[])
    }
  })

  return () => off(hotspotsRef, "value", listener)
}

// Get all products that have hotspots configured
export async function getAllProductsWithHotspots(): Promise<string[]> {
  const hotspotsRef = ref(database, "storeConfig/productHotspots")
  const snapshot = await get(hotspotsRef)

  if (!snapshot.exists()) return []
  return Object.keys(snapshot.val())
}

// Subscribe to all product hotspots
export function subscribeToAllProductHotspots(callback: (config: ProductHotspotsConfig) => void): () => void {
  const hotspotsRef = ref(database, "storeConfig/productHotspots")

  const listener = onValue(hotspotsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback({})
      return
    }
    callback(snapshot.val() as ProductHotspotsConfig)
  })

  return () => off(hotspotsRef, "value", listener)
}

// ============================================
// SHOP THE LOOK FEATURED PRODUCTS
// ============================================

export interface ShopTheLookFeatured {
  productId: string
  order: number
}

export interface ShopTheLookConfig {
  featuredProducts: ShopTheLookFeatured[]
  enabled: boolean
}

const defaultShopTheLookConfig: ShopTheLookConfig = {
  featuredProducts: [],
  enabled: true,
}

// Get Shop the Look config
export async function getShopTheLookConfig(): Promise<ShopTheLookConfig> {
  const configRef = ref(database, "storeConfig/shopTheLook")
  const snapshot = await get(configRef)

  if (!snapshot.exists()) return defaultShopTheLookConfig
  return { ...defaultShopTheLookConfig, ...snapshot.val() }
}

// Update Shop the Look config
export async function updateShopTheLookConfig(config: Partial<ShopTheLookConfig>): Promise<void> {
  const configRef = ref(database, "storeConfig/shopTheLook")
  await update(configRef, config)
}

// Subscribe to Shop the Look config changes
export function subscribeToShopTheLookConfig(callback: (config: ShopTheLookConfig) => void): () => void {
  const configRef = ref(database, "storeConfig/shopTheLook")

  const listener = onValue(configRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(defaultShopTheLookConfig)
      return
    }
    callback({ ...defaultShopTheLookConfig, ...snapshot.val() })
  })

  return () => off(configRef, "value", listener)
}

// ============================================
// HERO SECTION CONFIG
// ============================================

export interface HeroConfig {
  title: string
  titleHighlight: string
  subtitle: string
  badge: string
  mainImage: string
  secondaryImage: string
  discountText: string
  discountSubtext: string
  stat1Value: string
  stat1Label: string
  stat2Value: string
  stat2Label: string
  stat3Value: string
  stat3Label: string
  enabled: boolean
}

const defaultHeroConfig: HeroConfig = {
  title: "O Verão dos",
  titleHighlight: "Seus Sonhos",
  subtitle:
    "Biquínis exclusivos para mulheres que brilham. Descubra nossa coleção cuidadosamente selecionada para o seu verão perfeito.",
  badge: "Coleção Verão 2025",
  mainImage: "/images/photo-2025-12-21-21-01-36.jpg",
  secondaryImage: "/images/photo-2025-12-27-01-43-22.jpg",
  discountText: "-30%",
  discountSubtext: "Primeira Compra",
  stat1Value: "50+",
  stat1Label: "Peças Exclusivas",
  stat2Value: "24h",
  stat2Label: "Envio Express",
  stat3Value: "5k+",
  stat3Label: "Clientes Felizes",
  enabled: true,
}

// Get Hero config
export async function getHeroConfig(): Promise<HeroConfig> {
  const configRef = ref(database, "storeConfig/hero")
  const snapshot = await get(configRef)

  if (!snapshot.exists()) return defaultHeroConfig
  return { ...defaultHeroConfig, ...snapshot.val() }
}

// Update Hero config
export async function updateHeroConfig(config: Partial<HeroConfig>): Promise<void> {
  const configRef = ref(database, "storeConfig/hero")
  await update(configRef, config)
}

// Subscribe to Hero config changes
export function subscribeToHeroConfig(callback: (config: HeroConfig) => void): () => void {
  const configRef = ref(database, "storeConfig/hero")

  const listener = onValue(configRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(defaultHeroConfig)
      return
    }
    callback({ ...defaultHeroConfig, ...snapshot.val() })
  })

  return () => off(configRef, "value", listener)
}

// ============================================
// PRODUCT RECOMMENDATION SECTIONS
// ============================================

export interface RecommendationSection {
  id: string
  title: string
  description?: string
  type: "related" | "upsell" | "cross-sell" | "custom"
  productIds: string[]
  showOnCategories: string[] // which product categories show this section
  enabled: boolean
  order: number
}

const defaultRecommendationSections: RecommendationSection[] = [
  {
    id: "related",
    title: "Você também pode gostar",
    type: "related",
    productIds: [],
    showOnCategories: ["conjuntos", "tops", "calcinhas"],
    enabled: true,
    order: 1,
  },
]

// Get all recommendation sections
export async function getRecommendationSections(): Promise<RecommendationSection[]> {
  const sectionsRef = ref(database, "storeConfig/recommendationSections")
  const snapshot = await get(sectionsRef)

  if (!snapshot.exists()) return defaultRecommendationSections

  const sections: RecommendationSection[] = []
  snapshot.forEach((child) => {
    sections.push(child.val() as RecommendationSection)
  })

  return sections.sort((a, b) => a.order - b.order)
}

// Create recommendation section
export async function createRecommendationSection(section: Omit<RecommendationSection, "id">): Promise<string> {
  const sectionsRef = ref(database, "storeConfig/recommendationSections")
  const snapshot = await get(sectionsRef)

  const id = `section-${Date.now()}`
  const sectionRef = ref(database, `storeConfig/recommendationSections/${id}`)

  await set(sectionRef, { ...section, id })
  return id
}

// Update recommendation section
export async function updateRecommendationSection(id: string, updates: Partial<RecommendationSection>): Promise<void> {
  const sectionRef = ref(database, `storeConfig/recommendationSections/${id}`)
  await update(sectionRef, updates)
}

// Delete recommendation section
export async function deleteRecommendationSection(id: string): Promise<void> {
  const sectionRef = ref(database, `storeConfig/recommendationSections/${id}`)
  await set(sectionRef, null)
}

// Subscribe to recommendation sections changes
export function subscribeToRecommendationSections(callback: (sections: RecommendationSection[]) => void): () => void {
  const sectionsRef = ref(database, "storeConfig/recommendationSections")

  const listener = onValue(sectionsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(defaultRecommendationSections)
      return
    }

    const sections: RecommendationSection[] = []
    snapshot.forEach((child) => {
      sections.push(child.val() as RecommendationSection)
    })

    callback(sections.sort((a, b) => a.order - b.order))
  })

  return () => off(sectionsRef, "value", listener)
}

// ============================================
// STORYTELLING CONFIG
// ============================================

export interface TimelineItem {
  id: string
  year: string
  title: string
  description: string
  image: string
  highlight: string
  order: number
}

export interface StorytellingStats {
  number: string
  label: string
  icon: "heart" | "package" | "star" | "sparkles"
}

export interface StorytellingValue {
  id: string
  title: string
  description: string
  icon: "heart" | "package" | "users"
}

export interface StorytellingConfig {
  // Header
  sectionTitle: string
  sectionSubtitle: string

  // Quote
  quote: string
  founderName: string
  founderTitle: string
  founderImage: string

  // Timeline
  timelineTitle: string
  timelineItems: TimelineItem[]

  // Stats
  stats: StorytellingStats[]

  // Values
  values: StorytellingValue[]

  enabled: boolean
}

const defaultStorytellingConfig: StorytellingConfig = {
  sectionTitle: "Nossa História",
  sectionSubtitle:
    "Por trás de cada peça existe uma mulher real, com sonhos reais. Uma jornada de dedicação, amor e muitas noites em claro para entregar o melhor para você.",
  quote:
    "Eu não vendo apenas lingerie. Eu vendo autoestima, confiança e aquele sorrisinho que você dá quando se sente linda. Cada cliente é especial, e cada pedido é tratado como se fosse o único.",
  founderName: "Isabella",
  founderTitle: "Fundadora & CEO",
  founderImage: "/professional-woman-portrait-founder-entrepreneur.jpg",
  timelineTitle: "Minha Jornada",
  timelineItems: [
    {
      id: "1",
      year: "2021",
      title: "O Começo do Sonho",
      description:
        "Tudo começou em um quartinho pequeno, com poucos produtos e muita vontade de crescer. Cada pedido era embalado com carinho no chão, com fita rosa e bilhetinhos escritos à mão.",
      image: "/young-woman-packing-orders-on-floor-humble-beginni.jpg",
      highlight: "Primeiro pedido enviado",
      order: 0,
    },
    {
      id: "2",
      year: "2022",
      title: "Primeiros Passos",
      description:
        "As clientes começaram a confiar, indicar para amigas, e o boca a boca fez mágica. Consegui meu primeiro estoquezinho organizado e uma mesa própria para trabalhar.",
      image: "/woman-entrepreneur-small-inventory-organized-works.jpg",
      highlight: "+500 clientes felizes",
      order: 1,
    },
    {
      id: "3",
      year: "2023",
      title: "Crescimento Real",
      description:
        "O trabalho duro trouxe frutos. Investi em qualidade, montei um espaço maior, e cada avaliação positiva me dava mais força para continuar. Vocês fizeram isso acontecer.",
      image: "/woman-business-owner-professional-workspace-invent.jpg",
      highlight: "+2000 pedidos entregues",
      order: 2,
    },
    {
      id: "4",
      year: "2024",
      title: "Realizando o Sonho",
      description:
        "Hoje tenho um espaço profissional, estoque completo, e o mais importante: a confiança de milhares de mulheres que escolheram fazer parte dessa história. Cada peça que sai daqui leva um pedacinho do meu coração.",
      image: "/professional-woman-business-owner-modern-workspace.jpg",
      highlight: "Sonho realizado",
      order: 3,
    },
  ],
  stats: [
    { number: "5.000+", label: "Clientes Felizes", icon: "heart" },
    { number: "10.000+", label: "Pedidos Entregues", icon: "package" },
    { number: "4.9", label: "Avaliação Média", icon: "star" },
    { number: "3", label: "Anos de História", icon: "sparkles" },
  ],
  values: [
    {
      id: "1",
      title: "Feito com Amor",
      description: "Cada peça é selecionada pessoalmente, garantindo qualidade e conforto que você merece.",
      icon: "heart",
    },
    {
      id: "2",
      title: "Entrega Cuidadosa",
      description: "Seu pedido é embalado com carinho, em embalagem discreta e com bilhetinho especial.",
      icon: "package",
    },
    {
      id: "3",
      title: "Atendimento Real",
      description: "Eu mesma respondo suas dúvidas. Nada de robôs, só conversa de mulher para mulher.",
      icon: "users",
    },
  ],
  enabled: true,
}

// Get Storytelling config
export async function getStorytellingConfig(): Promise<StorytellingConfig> {
  const configRef = ref(database, "storeConfig/storytelling")
  const snapshot = await get(configRef)

  if (!snapshot.exists()) return defaultStorytellingConfig
  return { ...defaultStorytellingConfig, ...snapshot.val() }
}

// Update Storytelling config
export async function updateStorytellingConfig(config: Partial<StorytellingConfig>): Promise<void> {
  const configRef = ref(database, "storeConfig/storytelling")
  await update(configRef, config)
}

// Subscribe to Storytelling config changes
export function subscribeToStorytellingConfig(callback: (config: StorytellingConfig) => void): () => void {
  const configRef = ref(database, "storeConfig/storytelling")

  const listener = onValue(configRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(defaultStorytellingConfig)
      return
    }
    callback({ ...defaultStorytellingConfig, ...snapshot.val() })
  })

  return () => off(configRef, "value", listener)
}

// ============================================
// CATEGORY BANNERS CONFIG
// ============================================

export interface CategoryBannerConfig {
  title: string
  description: string
  image: string
  badge?: string
  enabled: boolean
}

export interface CategoryBannersConfig {
  conjuntos: CategoryBannerConfig
  tops: CategoryBannerConfig
  calcinhas: CategoryBannerConfig
}

const defaultCategoryBannersConfig: CategoryBannersConfig = {
  conjuntos: {
    title: "Conjuntos",
    description: "Combinações perfeitas para o seu verão. Tops e calcinhas que combinam em harmonia.",
    image: "/vibrant-bikini-set.png",
    badge: "Coleção",
    enabled: true,
  },
  tops: {
    title: "Tops",
    description: "Monte seu look do seu jeito. Tops exclusivos para combinar com qualquer calcinha.",
    image: "/colorful-bikini-top.png",
    badge: "Coleção",
    enabled: true,
  },
  calcinhas: {
    title: "Calcinhas",
    description: "Modelos exclusivos com acabamento premium. Encontre o corte perfeito para você.",
    image: "/bikini-bottom.jpg",
    badge: "Coleção",
    enabled: true,
  },
}

// Get Category Banners config
export async function getCategoryBannersConfig(): Promise<CategoryBannersConfig> {
  const configRef = ref(database, "storeConfig/categoryBanners")
  const snapshot = await get(configRef)

  if (!snapshot.exists()) return defaultCategoryBannersConfig
  return { ...defaultCategoryBannersConfig, ...snapshot.val() }
}

// Update a specific category banner
export async function updateCategoryBanner(
  category: keyof CategoryBannersConfig,
  config: Partial<CategoryBannerConfig>,
): Promise<void> {
  const categoryRef = ref(database, `storeConfig/categoryBanners/${category}`)
  await update(categoryRef, config)
}

// Update all category banners
export async function updateCategoryBannersConfig(config: Partial<CategoryBannersConfig>): Promise<void> {
  const configRef = ref(database, "storeConfig/categoryBanners")
  await update(configRef, config)
}

// Subscribe to Category Banners config changes
export function subscribeToCategoryBannersConfig(callback: (config: CategoryBannersConfig) => void): () => void {
  const configRef = ref(database, "storeConfig/categoryBanners")

  const listener = onValue(configRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(defaultCategoryBannersConfig)
      return
    }
    callback({ ...defaultCategoryBannersConfig, ...snapshot.val() })
  })

  return () => off(configRef, "value", listener)
}

// ============================================
// BACKSTAGE GALLERY CONFIG
// ============================================

export interface BackstageImage {
  id: string
  image: string
  caption?: string
  size: "normal" | "large" // large = col-span-2 row-span-2
  order: number
}

export interface BackstageConfig {
  title: string
  description: string
  images: BackstageImage[]
  enabled: boolean
}

const defaultBackstageConfig: BackstageConfig = {
  title: "Bastidores",
  description:
    "Um pouquinho do dia a dia, das madrugadas embalando pedidos, e de toda a dedicação que coloco em cada envio.",
  images: [
    {
      id: "1",
      image: "",
      caption: "Embalando com carinho",
      size: "large",
      order: 0,
    },
    {
      id: "2",
      image: "",
      caption: "Estoque organizado",
      size: "normal",
      order: 1,
    },
    {
      id: "3",
      image: "",
      caption: "Bilhetinhos especiais",
      size: "normal",
      order: 2,
    },
    {
      id: "4",
      image: "",
      caption: "Trabalhando de madrugada",
      size: "normal",
      order: 3,
    },
    {
      id: "5",
      image: "",
      caption: "Enviando pedidos",
      size: "normal",
      order: 4,
    },
    {
      id: "6",
      image: "",
      caption: "Cliente feliz",
      size: "normal",
      order: 5,
    },
    {
      id: "7",
      image: "",
      caption: "Verificando qualidade",
      size: "normal",
      order: 6,
    },
    {
      id: "8",
      image: "",
      caption: "Setup de trabalho",
      size: "large",
      order: 7,
    },
  ],
  enabled: true,
}

// Get Backstage config
export async function getBackstageConfig(): Promise<BackstageConfig> {
  const configRef = ref(database, "storeConfig/backstage")
  const snapshot = await get(configRef)

  if (!snapshot.exists()) return defaultBackstageConfig
  return { ...defaultBackstageConfig, ...snapshot.val() }
}

// Update Backstage config
export async function updateBackstageConfig(config: Partial<BackstageConfig>): Promise<void> {
  const configRef = ref(database, "storeConfig/backstage")
  await update(configRef, config)
}

// Subscribe to Backstage config changes
export function subscribeToBackstageConfig(callback: (config: BackstageConfig) => void): () => void {
  const configRef = ref(database, "storeConfig/backstage")

  const listener = onValue(configRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(defaultBackstageConfig)
      return
    }
    callback({ ...defaultBackstageConfig, ...snapshot.val() })
  })

  return () => off(configRef, "value", listener)
}
