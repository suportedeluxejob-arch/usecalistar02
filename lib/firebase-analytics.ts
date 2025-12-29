import { database, ref, set, get, push, update, onValue, off } from "./firebase"

export interface VisitorSession {
  id: string
  startedAt: number
  lastActiveAt: number
  pages: string[]
  device: string
  country?: string
}

export interface SaleRecord {
  id: string
  orderId: string
  products: { productId: string; name: string; quantity: number; price: number }[]
  total: number
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled"
  customerName: string
  customerEmail: string
  createdAt: number
}

export interface DailyStats {
  date: string
  visitors: number
  pageViews: number
  sales: number
  revenue: number
}

// Track visitor (real-time presence)
export async function trackVisitor(sessionId: string, page: string): Promise<void> {
  const visitorRef = ref(database, `visitors/${sessionId}`)
  const snapshot = await get(visitorRef)

  if (snapshot.exists()) {
    const visitor = snapshot.val() as VisitorSession
    await update(visitorRef, {
      lastActiveAt: Date.now(),
      pages: [...new Set([...visitor.pages, page])],
    })
  } else {
    const newVisitor: VisitorSession = {
      id: sessionId,
      startedAt: Date.now(),
      lastActiveAt: Date.now(),
      pages: [page],
      device: typeof window !== "undefined" ? (window.innerWidth < 768 ? "mobile" : "desktop") : "unknown",
    }
    await set(visitorRef, newVisitor)
  }
}

// Get active visitors count (last 5 minutes)
export async function getActiveVisitors(): Promise<number> {
  const visitorsRef = ref(database, "visitors")
  const snapshot = await get(visitorsRef)

  if (!snapshot.exists()) return 0

  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  let count = 0

  snapshot.forEach((child) => {
    const visitor = child.val() as VisitorSession
    if (visitor.lastActiveAt > fiveMinutesAgo) {
      count++
    }
  })

  return count
}

// Subscribe to active visitors (real-time)
export function subscribeToActiveVisitors(callback: (count: number) => void): () => void {
  const visitorsRef = ref(database, "visitors")

  const listener = onValue(visitorsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(0)
      return
    }

    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    let count = 0

    snapshot.forEach((child) => {
      const visitor = child.val() as VisitorSession
      if (visitor.lastActiveAt > fiveMinutesAgo) {
        count++
      }
    })

    callback(count)
  })

  return () => off(visitorsRef, "value", listener)
}

// Create a sale record
export async function createSale(sale: Omit<SaleRecord, "id" | "createdAt">): Promise<string> {
  const salesRef = ref(database, "sales")
  const newSaleRef = push(salesRef)
  const saleId = newSaleRef.key!

  const newSale: SaleRecord = {
    ...sale,
    id: saleId,
    createdAt: Date.now(),
  }

  await set(newSaleRef, newSale)

  // Update daily stats
  const today = new Date().toISOString().split("T")[0]
  const statsRef = ref(database, `stats/${today}`)
  const statsSnapshot = await get(statsRef)

  if (statsSnapshot.exists()) {
    const stats = statsSnapshot.val() as DailyStats
    await update(statsRef, {
      sales: stats.sales + 1,
      revenue: stats.revenue + sale.total,
    })
  } else {
    await set(statsRef, {
      date: today,
      visitors: 0,
      pageViews: 0,
      sales: 1,
      revenue: sale.total,
    })
  }

  return saleId
}

// Get all sales
export async function getSales(): Promise<SaleRecord[]> {
  const salesRef = ref(database, "sales")
  const snapshot = await get(salesRef)

  if (!snapshot.exists()) return []

  const sales: SaleRecord[] = []
  snapshot.forEach((child) => {
    sales.push(child.val() as SaleRecord)
  })

  return sales.sort((a, b) => b.createdAt - a.createdAt)
}

// Subscribe to sales (real-time)
export function subscribeToSales(callback: (sales: SaleRecord[]) => void): () => void {
  const salesRef = ref(database, "sales")

  const listener = onValue(salesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([])
      return
    }

    const sales: SaleRecord[] = []
    snapshot.forEach((child) => {
      sales.push(child.val() as SaleRecord)
    })

    callback(sales.sort((a, b) => b.createdAt - a.createdAt))
  })

  return () => off(salesRef, "value", listener)
}

// Get stats for dashboard
export async function getDashboardStats(): Promise<{
  totalSales: number
  totalRevenue: number
  totalProducts: number
  activeVisitors: number
  todaySales: number
  todayRevenue: number
}> {
  const [sales, visitors] = await Promise.all([getSales(), getActiveVisitors()])

  const today = new Date().toISOString().split("T")[0]
  const todaySalesData = sales.filter((s) => new Date(s.createdAt).toISOString().split("T")[0] === today)

  return {
    totalSales: sales.length,
    totalRevenue: sales.reduce((acc, s) => acc + s.total, 0),
    totalProducts: 0, // Will be updated with actual count
    activeVisitors: visitors,
    todaySales: todaySalesData.length,
    todayRevenue: todaySalesData.reduce((acc, s) => acc + s.total, 0),
  }
}
