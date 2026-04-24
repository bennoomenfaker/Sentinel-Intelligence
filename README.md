# Sentinel Intelligence - Technical Documentation

## Overview

Data collection and analytics platform that collects content from RSS, Web, and PDF sources, filters by keywords, and provides word cloud visualization.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Frontend  │────▶│  NestJS Backend  │────▶│ PostgreSQL │
│  (Next.js)  │     │  (Collection     │     │  (Prisma)  │
└─────────────┘     │   Engine)        │     └─────────────┘
                    └──────────────────┘
```

## Data Models

### CollectionPlan
Represents a monitoring plan with a research question.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| projectId | String | Associated project (multi-tenant) |
| question | String | Research question |
| hypothesisId | String | Related hypothesis |
| frequency | String | ON_DEMAND, DAILY, WEEKLY, MONTHLY |
| isActive | Boolean | Plan enabled/disabled |
| lastCollectedAt | DateTime | Last collection timestamp |
| createdAt | DateTime | Creation timestamp |

**Relations:**
- One CollectionPlan has many Sources
- One CollectionPlan has many Keywords
- One CollectionPlan has many RawItems
- One CollectionPlan has many CollectionJobs

### Source
Data source for collection.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| collectionPlanId | UUID | Parent plan |
| type | String | RSS, WEB, or PDF |
| url | String | Source URL |
| label | Optional label | Display name |
| isActive | Boolean | Source enabled/disabled |

**Types:**
- `RSS` - RSS/Atom feed (parsed with rss-parser)
- `WEB` - Website scraping (axios + cheerio)
- `PDF` - PDF document

### Keyword
Filter keyword for content filtering.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| collectionPlanId | UUID | Parent plan |
| word | String | Keyword text |
| type | String | INCLUDE or EXCLUDE |

**Types:**
- `INCLUDE` - Content MUST contain this word
- `EXCLUDE` - Content MUST NOT contain this word

### RawItem
Collected data item.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| projectId | String | Associated project |
| collectionPlanId | UUID | Parent plan |
| sourceId | UUID | Source it came from |
| sourceType | String | RSS, WEB, or PDF |
| sourceUrl | String | Original URL |
| title | String? | Item title |
| description | String? | Short description |
| contentRaw | Text | Full content |
| contentHash | String | Unique hash (deduplication) |
| matchedKeywords | String[] | Keywords found in content |
| wordStats | JSON | Top word frequencies |
| fetchedAt | DateTime | Fetch timestamp |

### CollectionJob
Execution record of a collection run.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| collectionPlanId | UUID | Parent plan |
| projectId | String | Associated project |
| triggeredBy | String | MANUAL or SCHEDULED |
| status | String | PENDING, RUNNING, COMPLETED, FAILED |
| itemsCollected | Int | Total items fetched |
| itemsFiltered | Int | Items after keyword filter |
| itemsStored | Int | Unique items saved |
| errorMessage | String? | Error if failed |
| startedAt | DateTime | Start timestamp |
| completedAt | DateTime? | End timestamp |

**Statuses:**
- `PENDING` - Job queued
- `RUNNING` - Currently executing
- `COMPLETED` - Successfully finished
- `FAILED` - Error occurred

## Collection Flow

```
1. Create CollectionPlan → Question + Frequency
         ↓
2. Add Sources (RSS/Web/PDF URLs)
         ↓
3. Add Keywords (INCLUDE/EXCLUDE)
         ↓
4. Trigger /run or /collect
         ↓
5. Connector fetches data from sources
         ↓
6. Keyword filtering (INCLUDE/EXCLUDE)
         ↓
7. Deduplication (content hash)
         ↓
8. Text normalization (cleaning)
         ↓
9. Word frequency analysis
         ↓
10. Store in RawItem table
         ↓
11. Return results + word cloud
```

## API Endpoints

All endpoints require `projectId` as query parameter for multi-tenancy.

### Collection Plans

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/collection-plans` | Create a plan |
| GET | `/api/collection-plans?projectId=X` | List all plans |
| GET | `/api/collection-plans/:id?projectId=X` | Get plan details |
| DELETE | `/api/collection-plans/:id?projectId=X` | Delete a plan |

#### Create Plan
```bash
curl -X POST http://localhost:3000/api/collection-plans \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj-001",
    "question": "AI trends 2026?",
    "frequency": "ON_DEMAND"
  }'
```

Response:
```json
{
  "id": "uuid",
  "projectId": "proj-001",
  "question": "AI trends 2026?",
  "frequency": "ON_DEMAND",
  "isActive": true,
  "createdAt": "2026-04-24T..."
}
```

### Sources

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/collection-plans/:id/sources?projectId=X` | Add source |
| DELETE | `/api/collection-plans/:id/sources/:sourceId?projectId=X` | Delete source |

#### Add Web Source (Scrapping)
```bash
curl -X POST "http://localhost:3000/api/collection-plans/{planId}/sources?projectId=proj-001" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "WEB",
    "url": "https://example.com/blog",
    "label": "Example Blog"
  }'
```

**Web Scraping vs RSS:**
| Type | Use Case | Behavior |
|------|----------|----------|
| RSS | News feeds, blogs | Auto-parsed, structured data |
| WEB | Any website | BFS crawling, extracts all text |
| PDF | Documents | Text extraction |

### Keywords

#### Add Keyword (INCLUDE - must contain)
```bash
curl -X POST "http://localhost:3000/api/collection-plans/{planId}/keywords?projectId=proj-001" \
  -H "Content-Type: application/json" \
  -d '{"word": "AI", "type": "INCLUDE"}'
```

#### Add Keyword (EXCLUDE - must NOT contain)
```bash
curl -X POST "http://localhost:3000/api/collection-plans/{planId}/keywords?projectId=proj-001" \
  -H "Content-Type: application/json" \
  -d '{"word": "crypto", "type": "EXCLUDE"}'
```

**Examples:**
| Keyword | Type | Effect |
|---------|------|--------|
| "AI" | INCLUDE | Keeps items with "AI" |
| "machine learning" | INCLUDE | Keeps items with "machine learning" |
| "crypto" | EXCLUDE | Removes items with "crypto" |
| "spam" | EXCLUDE | Removes items with "spam" |

### Complete Example: Web Scraping with Keywords

```bash
# 1. Create plan
curl -X POST "http://localhost:3000/api/collection-plans" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "proj-001", "question": "Tech news", "frequency": "ON_DEMAND"}'

# 2. Add WEB source (not RSS)
curl -X POST "http://localhost:3000/api/collection-plans/{planId}/sources?projectId=proj-001" \
  -H "Content-Type: application/json" \
  -d '{"type": "WEB", "url": "https://techcrunch.com/tag/ai/", "label": "TechCrunch AI"}'

# 3. Add INCLUDE keywords
curl -X POST "http://localhost:3000/api/collection-plans/{planId}/keywords?projectId=proj-001" \
  -H "Content-Type: application/json" \
  -d '{"word": "artificial intelligence", "type": "INCLUDE"}'
curl -X POST "http://localhost:3000/api/collection-plans/{planId}/keywords?projectId=proj-001" \
  -H "Content-Type: application/json" \
  -d '{"word": "GPT", "type": "INCLUDE"}'

# 4. Add EXCLUDE keywords (filter out noise)
curl -X POST "http://localhost:3000/api/collection-plans/{planId}/keywords?projectId=proj-001" \
  -H "Content-Type: application/json" \
  -d '{"word": "crypto", "type": "EXCLUDE"}'
curl -X POST "http://localhost:3000/api/collection-plans/{planId}/keywords?projectId=proj-001" \
  -H "Content-Type: application/json" \
  -d '{"word": "nft", "type": "EXCLUDE"}'

# 5. Run collection
curl -X POST "http://localhost:3000/api/collection-plans/{planId}/run?projectId=proj-001"

# 6. Get results
curl "http://localhost:3000/api/collection-plans/{planId}/results?projectId=proj-001"
```

### Keywords

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/collection-plans/:id/keywords?projectId=X` | Add keyword |
| DELETE | `/api/collection-plans/:id/keywords/:keywordId?projectId=X` | Delete keyword |

#### Add Keyword
```bash
curl -X POST "http://localhost:3000/api/collection-plans/{planId}/keywords?projectId=proj-001" \
  -H "Content-Type: application/json" \
  -d '{
    "word": "artificial intelligence",
    "type": "INCLUDE"
  }'
```

### Collection Execution

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/collection-plans/:id/run?projectId=X` | Run sync (waits for result) |
| POST | `/api/collection-plans/:id/collect?projectId=X` | Run async (background) |
| GET | `/api/collection-plans/:id/results?projectId=X` | Get results + word cloud |
| GET | `/api/collection-plans/:id/jobs?projectId=X` | Get job history |

#### Run Collection (Sync)
```bash
curl -X POST "http://localhost:3000/api/collection-plans/{planId}/run?projectId=proj-001"
```

Response:
```json
{
  "success": true,
  "collected": 42,
  "items": [...],
  "wordCloud": [
    { "text": "AI", "value": 156 },
    { "text": "startup", "value": 89 },
    { "text": "funding", "value": 67 }
  ]
}
```

#### Get Results
```bash
curl "http://localhost:3000/api/collection-plans/{planId}/results?projectId=proj-001"
```

Response:
```json
{
  "items": [
    {
      "id": "...",
      "title": "AI Startup Raises $100M",
      "sourceType": "RSS",
      "sourceUrl": "https://...",
      "contentRaw": "...",
      "matchedKeywords": ["AI", "startup"],
      "wordStats": [...],
      "fetchedAt": "2026-04-24T..."
    }
  ],
  "wordCloud": [
    { "text": "AI", "value": 156 },
    { "text": "startup", "value": 89 }
  ],
  "total": 42
}
```

## Connectors

### RSS Connector
Fetches RSS/Atom feeds using `rss-parser`.

```typescript
// src/modules/collection-engine/connectors/rss.connector.ts
async fetch(url: string): Promise<CollectedData[]> {
  const parser = new Parser({
    timeout: 10000,
    headers: { 'User-Agent': 'Collector-Engine/1.0' }
  });
  const feed = await parser.parseURL(url);
  // Returns up to 20 items per feed
}
```

**How RSS works:**
1. Parse URL avec `rss-parser` library
2. Extract up to 20 items from feed
3. For each item: extract title, description, content, link, publish date
4. Return as CollectedData array

### Web Connector
Scrapes websites using `axios` + `cheerio`.

```typescript
// src/modules/collection-engine/connectors/web.connector.ts
async scrape(url: string): Promise<CollectedData[]> {
  const MAX_PAGES = 5;
  const visited = new Set();
  const queue = [url];
  
  while (queue.length > 0 && pageCount < MAX_PAGES) {
    const { data } = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(data);
    
    $('script, style, nav, header, footer, aside').remove();
    const title = $('title').text();
    const content = $('body').text();
    
    // Extract links for BFS
    $('a[href]').each((_, el) => {
      links.push($(el).attr('href'));
    });
  }
}
```

**How Web Scraping works:**
1. Start with given URL
2. Use axios to fetch HTML page
3. Use cheerio to parse HTML
4. Remove non-content elements (scripts, styles, nav, etc.)
5. Extract title and text content
6. Find links on page (BFS: crawl up to 5 pages)
7. Return collection of page content

### PDF Connector
Extracts text from PDF documents.

## Processing Pipeline

### Flow Explained

```
1. Connector fetches data from source (RSS or WEB)
         ↓
2. Raw items extracted (up to 20 for RSS, up to 5 pages for WEB)
         ↓
3. KEYWORD FILTER (INCLUDE/EXCLUDE)
   - INCLUDE: keep if contains keyword
   - EXCLUDE: remove if contains keyword
         ↓
4. DEDUPLICATION (SHA256 hash)
   - Avoid duplicate content in same project
         ↓
5. TEXT NORMALIZATION
   - Remove extra whitespace
   - Strip HTML tags
   - Normalize encoding
         ↓
6. WORD ANALYSIS
   - Count word frequency
   - Exclude stop words
   - Return top 20 words
         ↓
7. STORE in RawItem table
         ↓
8. RETURN results + wordCloud
```

### Keyword Filter Example

```javascript
// Input items from source
items = [
  { content: "AI is growing fast" },
  { content: "Crypto prices fall" },
  { content: "New AI model released" },
  { content: "Crypto scam warning" }
]

// Keywords: INCLUDE ["AI"], EXCLUDE ["crypto"]

// After filtering:
filtered = [
  { content: "AI is growing fast" },    // ✓ contains "AI"
  { content: "New AI model released" }   // ✓ contains "AI"
]
// Removed: "Crypto prices fall", "Crypto scam warning" (contains "crypto" = EXCLUDE)
```

### Word Analysis Example

```javascript
// Content: "AI AI AI machine learning is AI. Machine learning grows."
// After word analysis:
wordStats = [
  { text: "AI", value: 3 },
  { text: "machine", value: 2 },
  { text: "learning", value: 2 },
  { text: "grows", value: 1 }
]
```

### Word Cloud Sizes

| Frequency | Size | CSS Class |
|-----------|------|----------|
| ≥ 70% max | XL | text-5xl |
| ≥ 40% max | LG | text-3xl |
| ≥ 20% max | MD | text-xl |
| < 20% max | SM | text-base |

## Frequency Options

| Value | Description |
|-------|-------------|
| ON_DEMAND | Manual trigger only |
| DAILY | Runs daily via scheduler |
| WEEKLY | Runs weekly via scheduler |
| MONTHLY | Runs monthly via scheduler |

## Running the Project

```bash
# Start PostgreSQL
docker-compose up -d

# Run migrations
npx prisma migrate dev --name init

# Start backend
npm run start:dev

# Start frontend (separate terminal)
cd frontend && npm run dev
```

## Environment Variables

```env
DATABASE_URL="postgresql://collector:collector123@localhost:5432/collector_engine"
PORT=3000
```

## Tech Stack

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js + TypeScript + Tailwind CSS + Recharts
- **Connectors**: rss-parser, axios, cheerio




