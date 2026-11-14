import { useRef, useState } from 'react'
import { splitFaces, SAMPLE_FACES } from './emoji.js'

const DEFAULT_TEXT =
  'Monday again 😴 but coffee is here 😍\nShipped the thing 🥳 nobody noticed 🙄\nStill, good day 😀 🔥 👍'

// Crop the chosen image to a centred square and shrink it,
// so it stays sharp as an emoji without holding a huge file in memory.
function toSquare(file, size = 320) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      canvas
        .getContext('2d')
        .drawImage(
          img,
          (img.width - side) / 2,
          (img.height - side) / 2,
          side,
          side,
          0,
          0,
          size,
          size,
        )
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image'))
    }
    img.src = url
  })
}

function Face({ photo, emoji, badge = false }) {
  if (!photo) return <span className="emoji">{emoji}</span>
  return (
    <span className="face" role="img" aria-label={`Your face replacing ${emoji}`}>
      <img src={photo} alt="" />
      {badge && <span className="face-badge">{emoji}</span>}
    </span>
  )
}

export default function App() {
  const [photo, setPhoto] = useState(null)
  const [text, setText] = useState(DEFAULT_TEXT)
  const [error, setError] = useState('')
  const cameraInput = useRef(null)
  const galleryInput = useRef(null)

  async function onPick(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      setPhoto(await toSquare(file))
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }

  const parts = splitFaces(text)
  const faceCount = parts.filter((p) => p.type === 'face').length

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">Facemoji</p>
        <h1>
          Put your face on <Face photo={photo} emoji="😀" /> every emoji.
        </h1>
        <p className="lede">
          Take a photo or pick one from your gallery. Every yellow face emoji
          becomes you. Everything else stays as it is.
        </p>

        <div className="actions">
          <button className="btn primary" onClick={() => cameraInput.current.click()}>
            Take a photo
          </button>
          <button className="btn" onClick={() => galleryInput.current.click()}>
            Pick from gallery
          </button>
          {photo && (
            <button className="btn ghost" onClick={() => setPhoto(null)}>
              Remove photo
            </button>
          )}
        </div>
        {error && <p className="error" role="alert">{error}</p>}

        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="user"
          hidden
          onChange={onPick}
          data-testid="camera-input"
        />
        <input
          ref={galleryInput}
          type="file"
          accept="image/*"
          hidden
          onChange={onPick}
          data-testid="gallery-input"
        />
      </header>

      <section className="card">
        <h2>Your faces</h2>
        <div className="grid">
          {SAMPLE_FACES.map((emoji) => (
            <div className="tile" key={emoji}>
              <Face photo={photo} emoji={emoji} badge />
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Try it in a message</h2>
        <div className="composer">
          <label className="field">
            <span>Type anything with emojis</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
            />
          </label>
          <div className="field">
            <span>
              Preview
              {photo
                ? ` · ${faceCount} face${faceCount === 1 ? '' : 's'} replaced`
                : ' · add a photo to replace the faces'}
            </span>
            <p className="preview" data-testid="preview">
              {parts.map((part, i) =>
                part.type === 'face' ? (
                  <Face key={i} photo={photo} emoji={part.value} />
                ) : (
                  <span key={i}>{part.value}</span>
                ),
              )}
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        Your photo never leaves your device. Open source under the MIT licence.
      </footer>
    </main>
  )
}
