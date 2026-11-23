const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(request: Request) {
  const apiKey = process.env.IMGBB_API_KEY

  if (!apiKey) {
    return Response.json(
      { message: "ImgBB API key is missing in the client .env file" },
      { status: 500 }
    )
  }

  let incoming: FormData

  try {
    incoming = await request.formData()
  } catch {
    return Response.json(
      { message: "The uploaded form data could not be read" },
      { status: 400 }
    )
  }

  const file = incoming.get("image")

  if (!(file instanceof File) || file.size === 0) {
    return Response.json(
      { message: "An image file is required" },
      { status: 400 }
    )
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return Response.json(
      { message: "Image is too large. Please upload a file under 5 MB." },
      { status: 413 }
    )
  }

  if (!file.type.startsWith("image/")) {
    return Response.json(
      { message: "Only image files (JPG, PNG, WebP) are allowed" },
      { status: 400 }
    )
  }

  const form = new FormData()
  form.append("image", file, file.name || "menu-item.png")

  try {
    const imgbbResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      { method: "POST", body: form, cache: "no-store" }
    )

    const imgbbData = await imgbbResponse.json().catch(() => null)
    const url = imgbbData?.data?.url || imgbbData?.data?.display_url

    if (!imgbbResponse.ok || !imgbbData?.success || !url) {
      return Response.json(
        {
          message:
            imgbbData?.error?.message ||
            "Could not upload the image to ImgBB",
        },
        { status: 502 }
      )
    }

    return Response.json({
      success: true,
      url,
      display_url: imgbbData.data.display_url || url,
    })
  } catch (error) {
    console.error("ImgBB upload error:", error)

    return Response.json(
      { message: "Could not reach ImgBB. Please try again." },
      { status: 502 }
    )
  }
}

export async function GET() {
  const configured = Boolean(process.env.IMGBB_API_KEY)

  return Response.json({
    success: true,
    configured,
    message: configured
      ? "ImgBB API route is working!"
      : "IMGBB_API_KEY is not configured.",
  })
}
