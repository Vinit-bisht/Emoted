// Minimal Gemini image call, shared by the sample script and the server.
// Uses generateContent; images are { mimeType, data(base64) }.

export const DEFAULT_MODEL = 'gemini-3.1-flash-image'

export async function generateImage({ key, model = DEFAULT_MODEL, prompt, images = [] }) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model || DEFAULT_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } })),
            ],
          },
        ],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1' } },
      }),
    },
  )
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error?.message || `Gemini error ${res.status}`)
  const parts = body.candidates?.[0]?.content?.parts || []
  const image = parts.find((p) => p.inlineData)?.inlineData
  if (!image) {
    const reason = body.candidates?.[0]?.finishReason || body.promptFeedback?.blockReason || 'no image returned'
    throw new Error(`Gemini returned no image (${reason})`)
  }
  return { mimeType: image.mimeType || 'image/png', data: image.data }
}
