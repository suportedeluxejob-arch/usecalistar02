import { NextResponse } from "next/server"

const PAGOU_API_URL = "https://api.pagou.ai/pix/v1/payment"

interface PaymentRequest {
  value: number
  description: string
  payer: {
    fullName: string
    document: string
    phone: string
    email: string
    address: {
      zipCode: string
      street: string
      neighborhood: string
      number: string
      complement?: string
      city: string
      state: string
      country: string
    }
  }
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    size?: string
    color?: string
  }>
}

export async function POST(request: Request) {
  console.log("[v0] === PAGOU PAYMENT API CALLED ===")

  try {
    const PAGOU_SECRET_KEY = process.env.PAGOU_SECRET_KEY

    console.log("[v0] PAGOU_SECRET_KEY exists:", !!PAGOU_SECRET_KEY)
    console.log("[v0] PAGOU_SECRET_KEY first 10 chars:", PAGOU_SECRET_KEY?.substring(0, 10))

    if (!PAGOU_SECRET_KEY) {
      console.error("[v0] PAGOU_SECRET_KEY is not configured")
      return NextResponse.json(
        { error: "Payment service is not configured. Please add PAGOU_SECRET_KEY environment variable." },
        { status: 500 },
      )
    }

    const body: PaymentRequest = await request.json()
    console.log("[v0] Request body received:", JSON.stringify(body, null, 2))

    // Generate unique external ID for this transaction
    const externalId = `order-${Date.now()}-${Math.random().toString(36).substring(7)}`

    const paymentBody = {
      type: "PIX",
      payer: {
        fullName: body.payer.fullName,
        document: body.payer.document,
        contact: {
          phone: body.payer.phone,
          mail: body.payer.email,
        },
        address: {
          zipCode: body.payer.address.zipCode,
          street: body.payer.address.street,
          neighboor: body.payer.address.neighborhood, // Note: API uses "neighboor" (typo in their API)
          number: body.payer.address.number,
          city: body.payer.address.city,
          state: body.payer.address.state,
          country: body.payer.address.country,
        },
      },
      transaction: {
        value: body.value,
        description: body.description,
        externalId: externalId,
        expirationTime: 86400, // 24 hours in seconds
      },
    }

    console.log("[v0] Pagou AI request payload:", JSON.stringify(paymentBody, null, 2))
    console.log("[v0] Making request to:", PAGOU_API_URL)
    console.log("[v0] Auth header being sent - X-API-Key:", PAGOU_SECRET_KEY?.substring(0, 15) + "...")

    const response = await fetch(PAGOU_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": PAGOU_SECRET_KEY,
      },
      body: JSON.stringify(paymentBody),
    })

    console.log("[v0] Pagou AI response status:", response.status)
    console.log("[v0] Pagou AI response headers:", Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log("[v0] Pagou AI raw response:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      console.error("[v0] Failed to parse Pagou AI response:", responseText)
      return NextResponse.json({ error: `Invalid response from payment service: ${responseText}` }, { status: 500 })
    }

    if (!response.ok) {
      console.error("[v0] Pagou AI API error:", data)
      return NextResponse.json(
        { error: data.message || data.error || `Payment failed with status ${response.status}` },
        { status: response.status },
      )
    }

    console.log("[v0] Payment created successfully:", data)

    // Return payment data to client
    return NextResponse.json({
      transactionId: data.transactionId,
      status: data.status,
      pixQrCode: data.pixQrCode,
      pixCode: data.pixCode,
      expirationDate: data.expirationDate,
      paymentLink: data.paymentLink,
    })
  } catch (error) {
    console.error("[v0] Error creating payment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
