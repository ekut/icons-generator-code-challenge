# Technology Stack

## Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios
- **Testing**: Vitest, React Testing Library, fast-check (property-based testing)
- **Deployment**: AWS Amplify

## Backend

- **Runtime**: Node.js 22.x (AWS Lambda currently supports nodejs20.x, nodejs22.x, nodejs24.x)
- **Language**: TypeScript (compiled to ES modules)
- **Module System**: ES modules (`.mjs` files or `"type": "module"` in package.json)
- **Framework**: AWS Lambda (serverless)
- **Infrastructure**: Serverless Framework 4
- **API**: AWS API Gateway (HTTP API with CORS)
- **Image Generation**: Replicate API (FLUX-schnell model)
- **Local Development**: serverless-offline

### Why ES Modules for Lambda?

AWS Lambda **recommends ES modules** for Node.js functions because:
- Support for top-level `await` during initialization phase
- Modern JavaScript standard
- Better tree-shaking and optimization
- Consistent with frontend module system
- Default choice in AWS Lambda console (creates `index.mjs`)

## Common Commands

### Backend

```bash
cd backend
npm install              # Install dependencies
npm run build           # Compile TypeScript
npm run dev             # Run locally with serverless-offline (port 3000)
npm run deploy          # Build and deploy to AWS
```

### Frontend

```bash
cd frontend
npm install              # Install dependencies
npm run dev             # Start dev server (port 5173)
npm run build           # Build for production
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
npm run lint            # Run ESLint
```

## Environment Variables

### Backend (.env)
- `REPLICATE_API_TOKEN`: Replicate API authentication token
- `NODE_ENV`: Environment (development/production)
- `AWS_REGION`: AWS deployment region

### Frontend (.env)
- `VITE_API_GATEWAY_URL`: Backend API endpoint (http://localhost:3000 for local dev)

## API Endpoints

- `POST /api/generate` - Generate 4 icons from prompt and style
- `GET /api/styles` - Retrieve available style presets

## Documentation Requirements

**Always use up-to-date official documentation** when working with libraries, frameworks, and AWS services:

### AWS Services
- Use AWS documentation MCP server or official AWS docs: https://docs.aws.amazon.com/
- Verify Lambda runtime features for Node.js 22.x (current project runtime)
- Check current API Gateway, S3, and other service capabilities

### Libraries & Frameworks
- **Replicate API**: https://replicate.com/docs
- **Serverless Framework**: https://www.serverless.com/framework/docs
- **React**: https://react.dev/
- **Vite**: https://vite.dev/
- **Vitest**: https://vitest.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs

### Best Practices
- Verify syntax and API changes before implementing
- Check deprecation notices and migration guides
- Use MCP tools (aws-docs, context7, llms.text) for current documentation
- Don't rely on outdated examples or Stack Overflow answers without verification
