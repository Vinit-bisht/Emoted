import { useRef, useState } from 'react'
import { BASE_PROMPT, EXPRESSIONS, expressionPrompt } from './prompts.js'
import { generateImage, DEFAULT_MODEL } from './gemini.js'
import { fileToSquareJpeg, toTransparentPng } from './cutout.js'

const KEY_STORE = 'facemoji.geminiKey'
const TRY_SET = ['😂', '😍', '😎']
const ALL = Object.keys(EXPRESSIONS)

function readKey() {
  try {
    return localStorage.getItem(KEY_STORE) || ''
  } catch {
    return ''
  }
}

function writeKey(value) {
  try {
    if (value) localStorage.setItem(KEY_STORE, value)
    else localStorage.removeItem(KEY_STORE)
  } catch {
    /* storage blocked: key just isn't remembered */
  }
}

// Builds a cartoon emoji set from one photo with the viewer's own Gemini key.
// The key and photo go straight from this browser to Google; nothing else sees them.
export default function CartoonMaker({ cartoons, onCartoon, onReset }) {
  const [key, setKey] = useState(readKey)
  const [remember, setRemember] = useState(() => Boolean(readKey()))
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [source, setSource] = useState(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const baseRef = useRef(null)
  const fileInput = useRef(null)

  async function onPick(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const square = await fileToSquareJpeg(file)
      setSource({ ...square, preview: `data:image/jpeg;base64,${square.data}` })
      baseRef.current = null
      onReset()
      setError('')
      setStatus('')
    } catch (e) {
      setError(e.message)
    }
  }

  async function run(emojis) {
    if (!key.trim()) return setError('Paste your Gemini API key first.')
    if (!source) return setError('Choose a photo first.')
    writeKey(remember ? key.trim() : '')
    setBusy(true)
    setError('')
    const photo = { mimeType: source.mimeType, data: source.data }
    try {
      if (!baseRef.current) {
        setStatus('Drawing your cartoon character…')
        baseRef.current = await generateImage({ key: key.trim(), model, prompt: BASE_PROMPT, images: [photo] })
        onCartoon('base', await toTransparentPng(baseRef.current))
      }
      const todo = emojis.filter((e) => !cartoons[e])
      for (const [i, emoji] of todo.entries()) {
        setStatus(`Drawing ${emoji} (${i + 1} of ${todo.length})…`)
        const img = await generateImage({
          key: key.trim(),
          model,
          prompt: expressionPrompt(emoji),
          images: [baseRef.current, photo],
        })
        onCartoon(emoji, await toTransparentPng(img))
      }
      setStatus('Done.')
    } catch (e) {
      setError(e.message)
      setStatus('')
    } finally {
      setBusy(false)
    }
  }

  const made = ALL.filter((e) => cartoons[e]).length
  const remainingAll = ALL.length - made + (cartoons.base ? 0 : 1)

  return (
    <section className="card">
      <h2>Make cartoon emojis of you</h2>
      <p className="muted">
        AI redraws your face as an emoji in each expression. Uses your own Gemini API key, which
        goes straight from this browser to Google. Each image costs about 5–7 cents on your
        Google account.
      </p>

      <div className="maker">
        <label className="field">
          <span>Gemini API key</span>
          <input
            type="password"
            autoComplete="off"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste your key"
          />
        </label>
        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember the key in this browser
        </label>
        <label className="field">
          <span>Model</span>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="gemini-3.1-flash-image">Nano Banana 2 (gemini-3.1-flash-image)</option>
            <option value="gemini-2.5-flash-image">Nano Banana (gemini-2.5-flash-image)</option>
            <option value="gemini-3-pro-image">Nano Banana Pro (gemini-3-pro-image)</option>
          </select>
        </label>

        <div className="source">
          {source ? (
            <img src={source.preview} alt="Your photo" />
          ) : (
            <div className="source-empty">No photo yet</div>
          )}
          <button className="btn" onClick={() => fileInput.current.click()} disabled={busy}>
            {source ? 'Change photo' : 'Choose a photo'}
          </button>
          <input ref={fileInput} type="file" accept="image/*" hidden onChange={onPick} />
        </div>

        <div className="actions">
          <button className="btn primary" disabled={busy} onClick={() => run(TRY_SET)}>
            Try 3 first
          </button>
          <button className="btn" disabled={busy} onClick={() => run(ALL)}>
            Make all 12 ({remainingAll} images left)
          </button>
        </div>
        {status && <p className="status" aria-live="polite">{status}</p>}
        {error && <p className="error" role="alert">{error}</p>}
      </div>

      {cartoons.base && (
        <div className="cartoon-grid">
          <figure>
            <img src={cartoons.base} alt="Your cartoon character" />
            <figcaption>Base</figcaption>
          </figure>
          {ALL.map((emoji) => (
            <figure key={emoji} className={cartoons[emoji] ? '' : 'pending'}>
              {cartoons[emoji] ? (
                <a href={cartoons[emoji]} download={`facemoji-${emoji.codePointAt(0).toString(16)}.png`}>
                  <img src={cartoons[emoji]} alt={`You as ${emoji}`} />
                </a>
              ) : (
                <span className="pending-emoji">{emoji}</span>
              )}
              <figcaption>{emoji}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  )
}
