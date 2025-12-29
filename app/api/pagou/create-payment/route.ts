import { NextResponse } from "next/server"

const PAGOU_API_URL = "https://api.pagou.ai/pix/v1/payment"
const PAGOU_SECRET_KEY = process.env.PAGOU_SECRET_KEY

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
  try {
    if (!PAGOU_SECRET_KEY) {
      console.error("PAGOU_SECRET_KEY is not configured")
      return NextResponse.json({ error: "Payment service is not configured" }, { status: 500 })
    }

    const body: PaymentRequest = await request.json()

    // Generate unique external ID for this transaction
    const externalId = `order-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // Prepare request body for Pagou AI API
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
          neighboor: body.payer.address.neighborhood,
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
        expirationTime: 86400, // 24 hours
      },
    }

    // Make request to Pagou AI API
    const response = await fetch(PAGOU_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apiKey: PAGOU_SECRET_KEY,
      },
      body: JSON.stringify(paymentBody),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Pagou AI API error:", data)
      return NextResponse.json({ error: data.message || "Failed to create payment" }, { status: response.status })
    }

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
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
