# Partnership Worksheet Form

A **static** web app for `Partnership Worksheet.pdf`.

## What it does
- captures all worksheet questions
- uses appropriate response types
  - yes/no → radio buttons
  - narrative prompts → textareas
  - amounts/percentages → numeric inputs
  - dates → date inputs
- autosaves in the browser with `localStorage`
- hides follow-up questions until relevant
- exports **CSV** for machine comparison
- exports **JSON** for backup or machine processing
- imports JSON back into the form
- keeps data isolated to the current browser/device

## Storage model
This version has **no backend**.

Answers are saved only in the user's browser. That means:
- simple deployment
- no server/database cost
- naturally isolated per user/browser

Tradeoff:
- data does not automatically sync between devices/browsers
- users should export JSON if they want a backup

## Local run
```bash
cd partnership-form
npm run serve
```

Then open:
- `http://localhost:3000/public/`

You can also open `public/index.html` directly, but a simple local server is safer for module loading.

## Export formats
### CSV
Machine-friendly row format:
- `section`
- `question_number`
- `prompt`
- `field_key`
- `field_label`
- `value`

This is ideal for comparing responses across exports.

### JSON
Includes:
- export timestamp
- flat answer object
- row-oriented field list

## Cheapest deployment options
### Best overall: Cloudflare Pages
- free for static sites
- easy deployment
- fast CDN
- no backend required

### Other free options
- GitHub Pages
- Netlify
- Vercel

## Recommendation
For this static version, I recommend **Cloudflare Pages** as the cheapest/easiest deployment option.

## Deployment prep included
This repo is ready for **GitHub Pages** deployment from the `docs/` directory.

Included in `docs/`:
- `docs/index.html`
- `docs/app.js`
- `docs/schema-data.js`
- `docs/styles.css`
- `docs/_headers`

The `public/` folder remains the working source for the static app, and `docs/` is the GitHub Pages publish folder.

To sync deploy files after changes:
```bash
npm run sync:docs
```

To run the CSV export smoke test with dummy data:
```bash
npm run test:export
```

## GitHub Pages deployment
1. Create a GitHub repository
2. Push this project to the repository
3. In GitHub, open **Settings** → **Pages**
4. Under **Build and deployment**:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main`
   - **Folder:** `/docs`
5. Save
6. Wait for GitHub Pages to publish the site

Your site will appear at a URL like:
- `https://your-username.github.io/your-repo-name/`

## Important GitHub Pages note
Because this is a static app:
- all saving happens in the browser
- CSV export happens in the browser
- JSON export/import happens in the browser
- there is no server or database to configure

## Pre-deploy check
Before deploying, confirm these work locally:
- form loads
- edits autosave after refresh
- **Export CSV** downloads correctly
- **Export JSON** downloads correctly
- **Import JSON** restores correctly

## Recommended final hosting choice
Use **GitHub Pages** if you want the simplest no-extra-tool deployment path.
