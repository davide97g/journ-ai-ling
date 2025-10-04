import { put } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 })
  }

  try {
    // Upload to Vercel Blob
    const blob = await put(`audio/${user.id}/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    return Response.json({ url: blob.url })
  } catch (error) {
    console.error("[v0] Error uploading file:", error)
    return Response.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
