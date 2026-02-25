# Mark Palkimas Personal Website

This repo is now set up for:
- Source control on GitHub
- Deployment on Vercel
- Custom domain routing (for `markpalkimas.com`)

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start locally:
   ```bash
   npm run dev
   ```
3. Open:
   ```
   http://localhost:3000
   ```

## Deploy with Vercel (from GitHub)

1. Push this repo to GitHub.
2. In Vercel, click **Add New Project** and import this GitHub repo.
3. Keep default settings. The included `vercel.json` deploys `server.js` as a serverless function.
4. Click **Deploy**.

## Connect custom domain

1. In Vercel project settings, open **Domains**.
2. Add `markpalkimas.com` and `www.markpalkimas.com`.
3. Follow Vercel DNS instructions:
   - `A` record for apex (`@`) to Vercel
   - `CNAME` record for `www` to Vercel target
4. After DNS propagates, Vercel will issue SSL automatically.

## Notes

- `CNAME` is a GitHub Pages artifact and is not required by Vercel.
- Resume file is hosted at:
  - `/assets/mark-palkimas-resume.pdf`
