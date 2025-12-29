import { NextResponse } from "next/server"

const PAGOU_API_URL = "https://api.pagou.ai/pix/v1/transactions"
const PAGOU_SECRET_KEY = process.env.PAGOU_SECRET_KEY

export async function GET(request: Request) {
  try {
    if (!PAGOU_SECRET_KEY) {
      return NextResponse.json({ error: "Payment service is not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("id")

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    // Check transaction status via Pagou AI API
    const response = await fetch(`${PAGOU_API_URL}/${transactionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apiKey: PAGOU_SECRET_KEY,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Pagou AI API error:", data)
      return NextResponse.json({ error: data.message || "Failed to check payment status" }, { status: response.status })
    }

    // Map Pagou status to our status
    let status = "WAITING_PAYMENT"
    if (data.operation?.status === "PAID") {
      status = "PAID"
    } else if (data.operation?.status === "ERROR") {
      status = "ERROR"
    } else if (data.operation?.status === "EXPIRED") {
      status = "EXPIRED"
    }

    return NextResponse.json({
      transactionId: data._id,
      status: status,
      value: data.operation?.value,
      paymentDate: data.operation?.paymentSettlementDate,
    })
  } catch (error) {
    console.error("Error checking payment status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
