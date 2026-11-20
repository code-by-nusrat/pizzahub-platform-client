export async function POST(request: Request) {
  const apiKey =
    process.env.IMGBB_API_KEY || process.env.IMGBB_API_KEY

  if (!apiKey) {
    return Response.json(
      { message: "ImgBB API key is missing in the client .env file" },
      { status: 500 }
    )
  }

  const incoming = await request.formData()
  const file = incoming.get("image")

  if (!(file instanceof File) || file.size === 0) {
    return Response.json(
      { message: "An image file is required" },
      { status: 400 }
    )
  }

  if (!file.type.startsWith("image/")) {
    return Response.json(
      { message: "Only image files (JPG, PNG, WebP) are allowed" },
      { status: 400 }
    )
  }

  const form = new FormData()
  form.append("image", file)

  const imgbbResponse = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
    { method: "POST", body: form }
  )

  const imgbbData = await imgbbResponse.json().catch(() => ({}))
  const url = imgbbData?.data?.url || imgbbData?.data?.display_url

  if (!imgbbResponse.ok || !imgbbData?.success || !url) {
    return Response.json(
      {
        message:
          imgbbData?.error?.message || "Could not upload the image to ImgBB",
      },
      { status: 502 }
    )
  }

  return Response.json({
    success: true,
    url,
    display_url: imgbbData.data.display_url || url,
  })
}






export async function GET() {
  return Response.json({
    success: true,
    message: "ImgBB API route is working!",
  })
}