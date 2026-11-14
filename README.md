# Facemoji

Take a photo or pick one from your gallery, and every yellow face emoji becomes your face. Other emojis are left alone. The photo stays in your browser; nothing is uploaded.

## Run it

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

Pushing to `main` deploys the site to GitHub Pages through the workflow in `.github/workflows/deploy.yml`.

## How it works

- `src/emoji.js` decides which emojis count as a yellow face and splits text into runs.
- `src/App.jsx` handles the photo (cropped to a square in the browser) and renders the result.
- `src/styles.css` holds all the styling.

## Licence

MIT
