import { type NextRequest, NextResponse } from "next/server"

const FITROOM_API_KEY = "b19dfc2619604a55af7976d01d4a9a2827410382cdfdb98a59caa7034b638d86"
const FITROOM_BASE_URL = "https://platform.fitroom.app"

async function createTryOnTask(
  modelImageBlob: Blob,
  clothImageBlob: Blob,
  clothType: "upper" | "lower" | "full_set",
): Promise<{ task_id: string; status: string }> {
  const formData = new FormData()
  formData.append("model_image", modelImageBlob, "model.jpg")
  formData.append("cloth_image", clothImageBlob, "cloth.jpg")
  formData.append("cloth_type", clothType)

  const response = await fetch(`${FITROOM_BASE_URL}/api/tryon/v2/tasks`, {
    method: "POST",
    headers: {
      "X-API-KEY": FITROOM_API_KEY,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("FitRoom Create Task Error:", errorData)
    throw new Error(`FitRoom API error: ${response.status} - ${JSON.stringify(errorData)}`)
  }

  return response.json()
}

async function pollTaskStatus(
  taskId: string,
  maxAttempts = 60,
  intervalMs = 2000,
): Promise<{ status: string; download_signed_url?: string; error?: string; progress: number }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${FITROOM_BASE_URL}/api/tryon/v2/tasks/${taskId}`, {
      method: "GET",
      headers: {
        "X-API-KEY": FITROOM_API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get task status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[v0] FitRoom Task ${taskId} - Status: ${data.status}, Progress: ${data.progress}%`)

    if (data.status === "COMPLETED") {
      return data
    }

    if (data.status === "FAILED") {
      throw new Error(data.error || "Task processing failed")
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error("Task timed out - processing took too long")
}

function base64ToBlob(base64: string, mimeType = "image/jpeg"): Blob {
  const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "")
  const byteCharacters = atob(cleanBase64)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

export async function POST(request: NextRequest) {
  try {
    const { userPhotoBase64, productImageUrl, productCategory } = await request.json()

    if (!userPhotoBase64 || !productImageUrl) {
      return NextResponse.json({ error: "Foto do usuário e imagem do produto são obrigatórios" }, { status: 400 })
    }

    console.log("[v0] Starting FitRoom virtual try-on...")

    // Convert user photo from base64 to Blob
    const modelImageBlob = base64ToBlob(userPhotoBase64)

    // Fetch product image and convert to Blob
    const productImageResponse = await fetch(productImageUrl)
    if (!productImageResponse.ok) {
      throw new Error("Failed to fetch product image")
    }
    const clothImageBlob = await productImageResponse.blob()

    // Determine cloth type based on category
    let clothType: "upper" | "lower" | "full_set" = "full_set"
    if (productCategory === "tops") {
      clothType = "upper"
    } else if (productCategory === "calcinhas") {
      clothType = "lower"
    }

    console.log(`[v0] Creating try-on task with cloth_type: ${clothType}`)

    // Create the try-on task
    const taskResult = await createTryOnTask(modelImageBlob, clothImageBlob, clothType)
    console.log(`[v0] Task created with ID: ${taskResult.task_id}`)

    // Poll for completion
    const completedTask = await pollTaskStatus(taskResult.task_id)

    if (!completedTask.download_signed_url) {
      throw new Error("No result image URL returned")
    }

    console.log("[v0] Try-on completed successfully!")

    return NextResponse.json({
      success: true,
      resultImageUrl: completedTask.download_signed_url,
      taskId: taskResult.task_id,
    })
  } catch (error) {
    console.error("Virtual Try-On Error:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

    // Check for specific error types
    if (errorMessage.includes("402")) {
      return NextResponse.json(
        { error: "Créditos insuficientes na API. Por favor, verifique seu plano." },
        { status: 402 },
      )
    }

    if (errorMessage.includes("429")) {
      return NextResponse.json(
        { error: "Limite de requisições atingido. Aguarde um momento e tente novamente." },
        { status: 429 },
      )
    }

    return NextResponse.json(
      {
        error: "Erro ao processar o provador virtual. Tente novamente.",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
