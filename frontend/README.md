# Frontend - Icon Set Generator

React application for generating themed icon sets with AI.

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7 (fast HMR, optimized builds)
- **Styling**: Tailwind CSS 4 (utility-first CSS)
- **HTTP Client**: Axios (API communication)
- **Testing**: Vitest, React Testing Library, fast-check
- **Deployment**: AWS Amplify

## Development

### Prerequisites

- Node.js 22.x or later
- Backend API running at `http://localhost:3000` (see `../backend/README.md`)

### Setup

```bash
npm install
cp .env.example .env
# Edit .env: VITE_API_GATEWAY_URL=http://localhost:3000
```

### Commands

```bash
npm run dev          # Dev server at http://localhost:5173
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Lint code
```

## Architecture

### Project Structure

```
src/
├── components/          # React components
│   ├── ColorInput.tsx   # Brand color input with HEX validation
│   ├── ErrorDisplay.tsx # Error messages with retry
│   ├── IconGrid.tsx     # 4-icon grid with download
│   ├── LoadingSpinner.tsx
│   ├── PromptInput.tsx  # Text prompt input
│   └── StyleSelector.tsx # 5 style presets
├── services/
│   └── api.ts           # Axios API client
├── types/
│   └── index.ts         # TypeScript types
├── App.tsx              # Main component
└── main.tsx             # Entry point
```

### Key Features

- Generate 4 unique 512x512 PNG icons from text prompt
- 5 visual styles: Pastels, Bubbles, Flat, Gradient, Outline
- Optional brand color customization (HEX codes)
- Individual and bulk download
- Error handling with retry
- Responsive design

### Environment Variables

#### Required Variables

| Variable | Description | Local Development | Production |
|----------|-------------|-------------------|------------|
| `VITE_API_GATEWAY_URL` | Backend API endpoint | `http://localhost:3000` | `https://your-api-id.execute-api.region.amazonaws.com/prod` |

**Important**: All Vite environment variables must be prefixed with `VITE_` to be exposed to client-side code.

#### Local Development Setup

1. **Copy the example file:**
```bash
cp .env.example .env
```

2. **Edit `.env`:**
```bash
VITE_API_GATEWAY_URL=http://localhost:3000
```

3. **Start the backend:**
```bash
cd ../backend
npm run dev
```

4. **Start the frontend:**
```bash
npm run dev
```

The frontend will now make API calls to `http://localhost:3000`.

#### Production: AWS Amplify Console Configuration

For production deployments, environment variables should be configured in the AWS Amplify Console, **NOT** in a `.env` file.

**Setup Instructions:**

1. **Navigate to AWS Amplify Console:**
   - Go to https://console.aws.amazon.com/amplify/
   - Select your app (icon-set-generator)

2. **Configure environment variables:**
   - Go to **App settings** → **Environment variables**
   - Click **Manage variables**

3. **Add the variable:**
   - Key: `VITE_API_GATEWAY_URL`
   - Value: `https://your-api-id.execute-api.us-east-1.amazonaws.com/prod`
   - (Get this URL from backend deployment output)

4. **Save and redeploy:**
   - Click **Save**
   - Trigger a new build or wait for next commit

**Benefits of Amplify Console environment variables:**
- Different values for different branches (dev, staging, prod)
- No secrets in source code
- Easy updates without code changes
- Automatic injection during build process

#### Branch-Specific Configuration

You can set different API Gateway URLs for different Git branches:

**Example:**
- `main` branch → Production API Gateway URL
- `develop` branch → Staging API Gateway URL
- Feature branches → Development API Gateway URL

**Setup:**
1. In Amplify Console, go to **App settings** → **Environment variables**
2. Click **Manage variables**
3. For `VITE_API_GATEWAY_URL`, click **Actions** → **Manage variable overrides**
4. Set different values for different branches:
   - `main`: `https://prod-api.execute-api.us-east-1.amazonaws.com/prod`
   - `develop`: `https://staging-api.execute-api.us-east-1.amazonaws.com/dev`

#### Verifying Environment Variables

**During local development:**
```typescript
// In your code
console.log('API URL:', import.meta.env.VITE_API_GATEWAY_URL);
```

**In production (Amplify build logs):**
1. Go to Amplify Console → **Build history**
2. Click on a build
3. Expand **Build** phase
4. Look for environment variable injection logs

**Testing the configuration:**
```bash
# Build locally with production env vars
VITE_API_GATEWAY_URL=https://your-api.execute-api.us-east-1.amazonaws.com/prod npm run build

# Preview the build
npm run preview
```

#### Troubleshooting

**Environment variable is `undefined` in code:**
- ✅ Verify the variable is prefixed with `VITE_`
- ✅ Restart the dev server after changing `.env`
- ✅ Check that `.env` file exists in `frontend/` directory
- ✅ Ensure the variable is not commented out

**API calls fail with CORS errors:**
- ✅ Verify backend is running at the URL specified in `VITE_API_GATEWAY_URL`
- ✅ Check backend CORS configuration in `serverless.yml`
- ✅ Ensure the URL doesn't have a trailing slash

**Production build doesn't use correct API URL:**
- ✅ Verify environment variable is set in Amplify Console
- ✅ Check build logs for environment variable injection
- ✅ Trigger a new build after changing environment variables

## Testing

### Test Strategy

- **Unit Tests**: Component rendering, validation, API client
- **Property-Based Tests**: HEX validation, icon cardinality, filename generation
- **Integration Tests**: Complete user workflows

```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm test -- --coverage # With coverage
```

### Test Coverage

All tests use mocks - no real API calls. Tests cover:
- Form validation (prompt, colors, style)
- Icon generation workflow
- Download functionality
- Error handling and retry

## Production Build

Vite optimizations:
- **Code splitting**: Separate React and Axios chunks
- **Minification**: esbuild (fast, efficient)
- **Source maps**: Enabled for debugging
- **Target**: ES2020 (modern browsers)

```bash
npm run build
# Output: dist/ (~280KB, gzipped: ~83KB)
```

## Deployment to AWS Amplify

### Prerequisites

- AWS Account with Amplify access
- GitHub repository
- Backend API Gateway URL (from backend deployment)

### Configuration

**Build (amplify.yml)** - Already configured:
- Build: `npm ci` → `npm run build`
- Output: `dist/`
- Caching: node_modules

**Environment Variables** - Set in Amplify Console:

| Variable | Value |
|----------|-------|
| `VITE_API_GATEWAY_URL` | `https://your-api-id.execute-api.region.amazonaws.com/prod` |

### Deployment Steps

**Using Amplify Console (Recommended for static sites)**

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**
3. Select **GitHub** as your Git provider
4. Authorize AWS Amplify to access your GitHub account
5. Select your repository and branch (e.g., `main`)
6. **Configure monorepo settings:**
   - Check **"My app is a monorepo"**
   - Enter app root path: `frontend`
   - Amplify will automatically set `AMPLIFY_MONOREPO_APP_ROOT=frontend` environment variable
   - Amplify auto-detects `amplify.yml` in the frontend directory
7. **Add environment variables:**
   - Click **Advanced settings** (or add later in App settings → Environment variables)
   - Add key: `VITE_API_GATEWAY_URL`
   - Add value: Your API Gateway URL from backend deployment (e.g., `https://abc123.execute-api.us-east-1.amazonaws.com/dev`)
8. Review build settings and click **"Save and deploy"**

Amplify will automatically:
- Install dependencies (`npm ci`)
- Build your app (`npm run build`)
- Deploy to CloudFront CDN
- Provide HTTPS URL

**Deployment time:** ~5 minutes for first deployment

**Important for monorepo:**
- The `amplify.yml` file includes `appRoot: frontend` which must match the `AMPLIFY_MONOREPO_APP_ROOT` environment variable
- Build commands run from the `frontend/` directory
- Artifacts are collected from `frontend/dist/`

**Note:** For static React/Vite apps, you don't need Amplify CLI or Amplify Gen 2. Simple GitHub integration through the Console is sufficient.

### SPA Routing Configuration (CRITICAL!)

Configure redirect in Amplify Console for client-side routing:

1. AWS Amplify Console → Select app
2. **Hosting** → **Rewrites and redirects** → **Manage redirects**
3. Add redirect rule:

```json
[
  {
    "source": "/<*>",
    "target": "/index.html",
    "status": "200",
    "condition": null
  }
]
```

This ensures React handles all routes.

### Cache Strategy (Optional)

For optimal performance:

1. AWS Amplify Console → **Hosting** → **Custom headers**
2. Add:

```yaml
customHeaders:
  - pattern: '**/*'
    headers:
      - key: 'Cache-Control'
        value: 'public, max-age=31536000, immutable'
  - pattern: '*.html'
    headers:
      - key: 'Cache-Control'
        value: 'no-cache'
```

### Monitoring

- **Build logs**: Amplify Console → "Build history"
- **Access logs**: Enable CloudFront logs in settings

### Cost Estimation

- Build: $0.01/minute
- Hosting: $0.15/GB served
- Free tier: 1,000 build minutes/month, 15 GB served/month
- **Estimated**: ~$0.20/month (within free tier)

## API Integration

Backend communication via Axios:

**Endpoints:**
- `GET /api/styles` - Fetch style presets
- `POST /api/generate` - Generate 4 icons

**Example request:**
```typescript
POST /api/generate
{
  "prompt": "toys",
  "style": "pastels",
  "brandColors": ["#FF5733"] // optional
}
```

**Example response:**
```typescript
{
  "success": true,
  "icons": [
    { "id": "1", "url": "https://...", "prompt": "toys", "style": "pastels" },
    // ... 3 more
  ]
}
```

## Troubleshooting

**API calls fail with CORS errors**
→ Ensure backend is running at `http://localhost:3000`

**Environment variable not available**
→ Verify `VITE_` prefix and restart dev server

**404 errors on page refresh (production)**
→ Configure SPA redirect in Amplify Console (see Deployment section above)

**Build fails with TypeScript errors**
→ Run `npm run build` for detailed errors

## Development Guidelines

- TypeScript strict mode enabled
- ES modules only (`import/export`)
- Write tests for new features
- Run linter before committing
