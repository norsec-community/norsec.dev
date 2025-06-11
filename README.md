# Norsec Community Website

A comprehensive Norwegian Cybersecurity community website featuring real-time breach tracking, conference calendars, and community announcements.

## 🚀 Features

- **🔒 Breach Tracker**: Real-time Norwegian cybersecurity incident tracking with dual filtering (type + year)
- **📅 Conference Calendar**: Cybersecurity conference listings with event details and copy-to-clipboard functionality
- **📢 News & Announcements**: Community updates and important notifications with pinning capability
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **⚡ Real-time Data**: Live integration with Google Sheets for up-to-date information

## 📊 Data Sources

- **Breach Tracker**: [Norwegian Cybersecurity Incidents](https://docs.google.com/spreadsheets/d/1n5gJkgPVoGnyeUZAlmQUzv1dKtlwsKgG_DaRktTSuEs/edit)
  - Primary maintainers: precursor, Furdy
  - Data includes organization name, incident type, year, and source links

- **Conference Calendar**: [Cybersecurity Events](https://docs.google.com/spreadsheets/d/1i3ltEo2GhEiAFWdQOOqp7DY0LZ9GRwKknie5FKGdB3k/edit)
  - Primary maintainer: ZeroChill
  - Nordic and European cybersecurity conferences with dates and venues

## 🛠️ Setup and Installation

### Prerequisites

- Node.js 18+ and npm
- Google Sheets API key (for data fetching)
- Git

### 1. Clone and Install

```bash
git clone <your-repository-url>
cd norsec-website
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key_here
```

**Getting a Google Sheets API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Create credentials (API Key)
5. Restrict the key to Google Sheets API for security

### 3. Development

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### 4. Build for Production

```bash
npm run build
```

## 📝 Managing Announcements

### Adding New Announcements

Edit the `announcements` array in **both** files:

1. **Home Page**: `client/src/pages/home.tsx` (around line 11)
2. **News Page**: `client/src/pages/news.tsx` (around line 7)

**Example:**
```javascript
{
  id: 4, // Use next available ID number
  title: "HackCon 2025 Registration Open",
  content: "Registration is now open for HackCon 2025, Norway's premier cybersecurity conference. Early bird pricing available until March 1st.",
  date: "February 1, 2025", // Format: Month DD, YYYY
  type: "Feature", // See types below
  pinned: true // Optional: pin to top
}
```

### Announcement Types

| Type | Color | Use Case |
|------|-------|----------|
| `Welcome` | Green | Welcome messages, introductions |
| `Feature` | Blue | New features, capabilities |
| `Update` | Purple | Updates to existing features |
| `Alert` | Red | Security alerts, urgent notices |
| `Announcement` | Gray | General announcements |

### Pinning Announcements

Set `pinned: true` for important announcements to:
- Display with blue left border and pin icon
- Appear at the top of the announcement list
- Show prominently on both home and news pages

## 🌐 Deployment Options

### GitHub Pages

1. Push code to GitHub repository
2. Go to repository Settings → Pages
3. Select source branch (usually `main`)
4. Add `GOOGLE_SHEETS_API_KEY` to repository secrets
5. The site will be available at `https://yourusername.github.io/repository-name`

### Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add `GOOGLE_SHEETS_API_KEY` environment variable
5. Deploy automatically on git push

### Vercel/Netlify

1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add `GOOGLE_SHEETS_API_KEY` environment variable
5. Deploy

## 🏗️ Project Structure

```
norsec-website/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Home, Calendar, etc.)
│   │   ├── lib/            # Utilities and query client
│   │   └── index.css       # Global styles and Norsec theme
│   ├── public/             # Static assets and redirect config
│   └── index.html          # HTML template
├── server/                 # Backend Express server
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes for data fetching
│   └── storage.ts          # Memory storage implementation
├── shared/                 # Shared TypeScript types
└── README.md               # This file
```

## 🎨 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui with Radix UI primitives
- **Routing**: Wouter (lightweight React router)
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with custom Norsec theme
- **Icons**: Lucide React

## 🎯 Key Features Explained

### Breach Tracker
- Filters by incident type (ransomware, espionage, breach, etc.)
- Filters by year (2018-2024+)
- Combined filtering for specific analysis
- Source attribution for each incident

### Conference Calendar
- Copy event links to clipboard
- Event categorization and location display
- Direct links to conference websites
- Proper attribution to data maintainer

### News System
- Announcements display on home page below the fold
- Dedicated news page for all announcements
- Pin system for important updates
- Easy content management through code

## 🔧 Customization

### Theme Colors

The Norsec theme is defined in `client/src/index.css`:

```css
:root {
  --norsec-primary: 210 100% 50%;    /* Blue */
  --norsec-secondary: 210 100% 40%;  /* Darker blue */
  --norsec-dark: 210 22% 22%;        /* Dark blue-gray */
  --norsec-light: 210 20% 98%;       /* Light gray */
}
```

### Adding New Pages

1. Create page component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Update navigation in `client/src/components/navigation.tsx`

## 🐛 Troubleshooting

### Common Issues

**Google Sheets API not working:**
- Verify API key is correct and has Sheets API access
- Check that sheets are publicly viewable or API key has proper permissions
- Ensure environment variable is set correctly

**Build errors:**
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors with `npm run check`
- Verify all file imports are correct

**Navigation warnings:**
- Navigation component uses proper Link components without nested anchors
- Check console for any remaining validateDOMNesting warnings

## 📞 Support

For technical issues or feature requests, contact the Norsec community administrators or create an issue in the repository.

## 📄 License

MIT License - feel free to use and modify for your community needs.