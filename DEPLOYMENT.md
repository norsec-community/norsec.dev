# Deployment Guide

## Quick Start

1. **Clone and setup**
   ```bash
   git clone <your-repo-url>
   cd norsec-website
   npm install
   cp .env.example .env
   # Edit .env with your Google Sheets API key
   ```

2. **Test locally**
   ```bash
   npm run dev
   ```

3. **Build and deploy**
   ```bash
   npm run build
   # Upload dist/ folder to your hosting platform
   ```

## Platform-Specific Instructions

### GitHub Pages
- Enable Pages in repository settings
- Add `GOOGLE_SHEETS_API_KEY` to repository secrets
- Site will be available at `https://username.github.io/repository-name`

### Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`
- Add environment variable: `GOOGLE_SHEETS_API_KEY`

### Vercel
- Import repository
- Build command: `npm run build`
- Output directory: `dist`
- Add environment variable in dashboard

## Environment Variables

Required:
- `GOOGLE_SHEETS_API_KEY`: Google Sheets API key for data access

## Troubleshooting

**Build fails**: Run `npm install` and check `npm run check`
**No data loading**: Verify API key and sheet permissions
**404 errors**: Check `_redirects` file in `client/public/`