# Sentinel Intelligence Platform

Strategic Monitoring & Data Collection Dashboard

## Overview

Sentinel Intelligence is a web-based platform for automated data collection and analysis from multiple sources (RSS feeds, websites, PDFs). It provides real-time monitoring with word cloud visualization, keyword filtering, and scheduled collection jobs.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Access the dashboard at http://localhost:3001

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx          # Main dashboard
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   └── WordCloudChart.tsx
├── lib/
│   └── api.ts            # API client
├── types/
│   └── index.ts          # TypeScript types
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Features

### Projects Management
- Multiple project workspaces
- Item counting per project

### Collection Plans
- Question-based data collection
- Configurable frequency (ON_DEMAND, DAILY, WEEKLY, MONTHLY)
- Source management
- Keyword filtering (INCLUDE/EXCLUDE)

### Sources
- RSS Feeds
- Websites
- PDF Documents

### Visualization
- Word Cloud - Top Keywords
- Source Distribution (Pie Chart)
- Top Keywords Bar Chart
- Collection Statistics

### Jobs History
- Job status tracking (COMPLETED, FAILED, RUNNING)
- Items collected/filtered/stored counts
- Error logging

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List projects |
| GET | `/projects/:projectId/plans` | List collection plans |
| POST | `/projects/:projectId/plans` | Create plan |
| DELETE | `/projects/:projectId/plans/:planId` | Delete plan |
| GET | `/projects/:projectId/plans/:planId/results` | Get collection results |
| GET | `/projects/:projectId/plans/:planId/jobs` | Get collection jobs |
| POST | `/projects/:projectId/plans/:planId/sources` | Add source |
| POST | `/projects/:projectId/plans/:planId/keywords` | Add keyword |
| POST | `/projects/:projectId/plans/:planId/run` | Run collection |

## Configuration

Environment variables in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Build

```bash
npm run build    # Production build
npm run start   # Start production server
npm run lint   # Run ESLint
```