# Talha Aslam — portfolio

Static site. No build step, no dependencies.

## Run locally

Open `index.html` in a browser, or serve it:

    npx serve .

## Deploy to Vercel

**Option A — dashboard**

1. Push this folder to a GitHub repository.
2. In Vercel, *Add New… → Project*, import the repository.
3. Framework preset: **Other**. Leave build command and output directory empty.
4. Deploy.

**Option B — CLI**

    npm i -g vercel
    vercel

Accept the defaults; when asked for a framework, choose **Other**.

## What to edit

| Change | Where |
|---|---|
| Any text | `index.html` |
| Colours, spacing, breakpoints | `styles.css` (tokens in `:root`) |
| Screenshots | `images/` — `*-sm.webp` is the thumbnail, `*.webp` the full size |
| CV files | `cv/` |
| Lightbox and nav highlighting | `script.js` |

## Before you publish

- Replace the mockups in `images/` with real screenshots when you have them, and delete the
  "Interface mockups" notes in `index.html` if they no longer apply.
- Check nothing in the screenshots carries real client data.
- Add a custom domain in Vercel → Settings → Domains.
