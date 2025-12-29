import { database, ref, set, get, push, remove, update, onValue, off } from "./firebase"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  discount?: number
  images: string[]
  category: "conjuntos" | "tops" | "calcinhas"
  sizes: string[]
  colors: string[]
  tags: string[]
  stock: number
  rating: number
  reviews: number
  featured: boolean
  active: boolean
  createdAt: number
  updatedAt: number
}

export interface ProductInput {
  name: string
  description: string
  price: number
  originalPrice?: number
  discount?: number
  images: string[]
  category: "conjuntos" | "tops" | "calcinhas"
  sizes: string[]
  colors: string[]
  tags: string[]
  stock: number
  featured?: boolean
  active?: boolean
}

// Create a new product
export async function createProduct(product: ProductInput): Promise<string> {
  const productsRef = ref(database, "products")
  const newProductRef = push(productsRef)
  const productId = newProductRef.key!

  const newProduct: Product = {
    id: productId,
    ...product,
    rating: 5,
    reviews: 0,
    featured: product.featured ?? false,
    active: product.active ?? true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  await set(newProductRef, newProduct)
  return productId
}

// Get all products
export async function getProducts(): Promise<Product[]> {
  const productsRef = ref(database, "products")
  const snapshot = await get(productsRef)

  if (!snapshot.exists()) return []

  const products: Product[] = []
  snapshot.forEach((child) => {
    products.push(child.val() as Product)
  })

  return products.sort((a, b) => b.createdAt - a.createdAt)
}

// Get active products only (for storefront)
export async function getActiveProducts(): Promise<Product[]> {
  const products = await getProducts()
  return products.filter((p) => p.active)
}

// Get a single product
export async function getProduct(id: string): Promise<Product | null> {
  const productRef = ref(database, `products/${id}`)
  const snapshot = await get(productRef)

  if (!snapshot.exists()) return null
  return snapshot.val() as Product
}

// Update a product
export async function updateProduct(id: string, updates: Partial<ProductInput>): Promise<void> {
  const productRef = ref(database, `products/${id}`)
  await update(productRef, {
    ...updates,
    updatedAt: Date.now(),
  })
}

// Delete a product
export async function deleteProduct(id: string): Promise<void> {
  const productRef = ref(database, `products/${id}`)
  await remove(productRef)
}

// Subscribe to products changes (real-time)
export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  const productsRef = ref(database, "products")

  const listener = onValue(productsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([])
      return
    }

    const products: Product[] = []
    snapshot.forEach((child) => {
      const data = child.val()
      products.push({
        ...data,
        images: data.images || [],
        sizes: data.sizes || [],
        colors: data.colors || [],
        tags: data.tags || [],
      } as Product)
    })

    callback(products.sort((a, b) => b.createdAt - a.createdAt))
  })

  return () => off(productsRef, "value", listener)
}
