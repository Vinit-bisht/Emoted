// Image helpers for the AI emoji flow, all done in the browser.

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read that image'))
    img.src = src
  })
}

// Centre-crop a picked file to a square JPEG for sending to the model.
export async function fileToSquareJpeg(file, size = 768) {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const side = Math.min(img.width, img.height)
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    canvas
      .getContext('2d')
      .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    return { mimeType: 'image/jpeg', data: dataUrl.split(',')[1] }
  } finally {
    URL.revokeObjectURL(url)
  }
}

// Turn a generated emoji (on a white background) into a small transparent PNG.
// Flood-fills near-white pixels connected to the border, so white inside the
// face (teeth, eyes) is kept.
export async function toTransparentPng({ mimeType, data }, size = 256, tolerance = 28) {
  const img = await loadImage(`data:${mimeType};base64,${data}`)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, size, size)
  const pixels = ctx.getImageData(0, 0, size, size)
  const px = pixels.data
  const isBg = (i) =>
    255 - px[i] <= tolerance && 255 - px[i + 1] <= tolerance && 255 - px[i + 2] <= tolerance

  const seen = new Uint8Array(size * size)
  const stack = []
  for (let k = 0; k < size; k++) stack.push(k, (size - 1) * size + k, k * size, k * size + size - 1)
  while (stack.length) {
    const p = stack.pop()
    if (seen[p]) continue
    seen[p] = 1
    if (!isBg(p * 4)) continue
    px[p * 4 + 3] = 0
    const x = p % size
    const y = (p - x) / size
    if (x > 0) stack.push(p - 1)
    if (x < size - 1) stack.push(p + 1)
    if (y > 0) stack.push(p - size)
    if (y < size - 1) stack.push(p + size)
  }
  ctx.putImageData(pixels, 0, 0)
  return canvas.toDataURL('image/png')
}
