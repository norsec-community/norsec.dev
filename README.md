# Norsec Community Website

A Norwegian Cybersecurity community website with breach tracking and conference calendar.

## Project Structure

```
norsec.dev/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components (navigation, footer, hero)
│   │   ├── pages/         # Page components (home, calendar, breach-tracker, news)
│   │   ├── lib/           # Utilities (queryClient, utils)
│   │   └── hooks/         # Custom hooks (use-mobile, use-toast)
│   └── index.html
├── functions/             # Cloudflare Workers API
│   ├── api/               # API handlers (breaches, conferences)
│   └── middleware/        # Middleware (rate-limiter)
├── wrangler.toml          # Cloudflare configuration
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Wouter (routing), TanStack Query
- **Backend/API**: Cloudflare Workers (functions/api/)
- **UI**: shadcn/ui with Radix UI primitives, Lucide icons

## Development

```bash
npm install
npm run dev     # Local dev server on port 5173
npm run build   # Production build to dist/
npm run check   # TypeScript type checking
```

## Deployment (Cloudflare Pages)

1. Connect repository to Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variable: `GOOGLE_SHEETS_API_KEY`

## Environment Variables

- `GOOGLE_SHEETS_API_KEY`: Google Sheets API key for data fetching

## Data Sources

- **Breach Tracker**: Google Sheet `1n5gJkgPVoGnyeUZAlmQUzv1dKtlwsKgG_DaRktTSuEs`
- **Conferences**: Google Sheet `1i3ltEo2GhEiAFWdQOOqp7DY0LZ9GRwKknie5FKGdB3k`
