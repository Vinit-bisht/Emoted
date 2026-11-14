// Which emojis count as a "yellow face".
// Ranges are Unicode code points for the smiley faces; the exclusions are
// faces that are not yellow (devils, red angry faces, clown, green, etc.).

const RANGES = [
  [0x1f600, 0x1f637],
  [0x1f641, 0x1f644],
  [0x1f910, 0x1f915],
  [0x1f917, 0x1f917],
  [0x1f920, 0x1f925],
  [0x1f927, 0x1f92f],
  [0x1f970, 0x1f974],
  [0x1f978, 0x1f97a],
  [0x1f9d0, 0x1f9d0],
  [0x1fae0, 0x1fae5],
  [0x1fae8, 0x1fae8],
  [0x2639, 0x263a],
]

const NOT_YELLOW = new Set([
  0x1f608, // smiling face with horns (purple)
  0x1f621, // pouting face (red)
  0x1f921, // clown face
  0x1f922, // nauseated face (green)
  0x1f92c, // face with symbols on mouth (red)
  0x1f92e, // face vomiting
])

export function isYellowFace(grapheme) {
  const cp = grapheme.codePointAt(0)
  if (NOT_YELLOW.has(cp)) return false
  return RANGES.some(([lo, hi]) => cp >= lo && cp <= hi)
}

const segmenter =
  typeof Intl !== 'undefined' && Intl.Segmenter
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null

// Split text into runs: { type: 'text', value } | { type: 'face', value }
export function splitFaces(text) {
  const graphemes = segmenter
    ? Array.from(segmenter.segment(text), (s) => s.segment)
    : Array.from(text)

  const parts = []
  let buffer = ''
  for (const g of graphemes) {
    if (isYellowFace(g)) {
      if (buffer) parts.push({ type: 'text', value: buffer })
      buffer = ''
      parts.push({ type: 'face', value: g })
    } else {
      buffer += g
    }
  }
  if (buffer) parts.push({ type: 'text', value: buffer })
  return parts
}

export const SAMPLE_FACES = [
  '😀', '😂', '😍', '😎', '🤔', '😴', '😭', '🥳', '😇', '🙄', '😬', '🤩',
]
