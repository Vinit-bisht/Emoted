// Prompts for turning one person's photo into a set of cartoon emojis.
// Step 1 makes a single neutral "character" so every emoji shares one look.
// Step 2 re-poses that character into each emoji expression.

export const STYLE = [
  'A single round emoji-style cartoon head in the glossy 3D look of modern phone emojis:',
  'a smooth spherical face, soft studio lighting, subtle shading, slightly oversized eyes,',
  'simple rounded features, no neck, no body, no text, no border.',
  'Plain pure white background (#FFFFFF), the head centred and filling about 85% of the frame.',
].join(' ')

export const LIKENESS = [
  'It must clearly look like the person in the photo: keep their skin tone, hairstyle and hair colour,',
  'eyebrow shape, eye shape, nose and face shape, and any facial hair, glasses or earrings.',
  'Simplify and cartoonise those traits rather than dropping them.',
].join(' ')

export const BASE_PROMPT = [
  'Turn the person in this photo into an emoji character.',
  STYLE,
  LIKENESS,
  'Expression: calm, neutral, mouth closed.',
].join(' ')

// One entry per emoji the app supports. `expression` describes only what changes.
export const EXPRESSIONS = {
  '😀': 'a wide open grin showing the top teeth, eyes open and happy',
  '😂': 'laughing hard with eyes squeezed shut, big open mouth, two large tears of joy flying out',
  '😍': 'a big smile with both eyes replaced by glossy red hearts',
  '😎': 'a confident smirk wearing black wayfarer sunglasses',
  '🤔': 'thinking, one eyebrow raised, mouth pushed to one side, a hand with index finger and thumb on the chin',
  '😴': 'asleep with eyes closed, mouth slightly open, a small blue "Zzz" above the head',
  '😭': 'loudly crying, mouth wide open, two streams of blue tears pouring from closed eyes',
  '🥳': 'celebrating, a colourful striped party hat, a party horn in the mouth, confetti around',
  '😇': 'a gentle closed-eye smile with a glowing gold halo above the head',
  '🙄': 'rolling the eyes upward, flat unimpressed mouth',
  '😬': 'grimacing, teeth clenched in a wide awkward line, eyebrows raised',
  '🤩': 'amazed, open-mouth smile, both eyes replaced by gold stars',
}

export function expressionPrompt(emoji) {
  const expression = EXPRESSIONS[emoji]
  if (!expression) throw new Error(`No expression defined for ${emoji}`)
  return [
    `Redraw this exact emoji character (same face, same hair, same skin tone, same style) with a new expression matching the ${emoji} emoji:`,
    `${expression}.`,
    'Keep everything else identical so it reads as the same character.',
    STYLE,
  ].join(' ')
}
