# Icon Set Generator

A web application that generates consistent sets of 4 themed icons using the Replicate API's FLUX-schnell model.

## Project Structure

```
icon-set-generator/
├── frontend/          # React + TypeScript + Vite frontend (AWS Amplify)
├── backend/           # Node.js + TypeScript Lambda functions (AWS Lambda)
└── README.md
```

## Prerequisites

- Node.js 22.x or higher
- npm
- AWS Account (for deployment)
- Replicate API Token

## Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Add your Replicate API token to `.env`:
```
REPLICATE_API_TOKEN=your_token_here
```

5. Build the project:
```bash
npm run build
```

6. Run locally with serverless-offline:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your API Gateway URL (or use localhost for development):
```
VITE_API_GATEWAY_URL=http://localhost:3000
```

5. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Development

### Development Without Real API Token

**IMPORTANT**: During development, you don't need a real Replicate API token!

All tests use mocks and don't make real API calls. You can develop and test locally with:

```bash
# Backend .env
REPLICATE_API_TOKEN=mock-token-for-development
```

This approach:
- ✅ Saves API costs (tokens are not ours)
- ✅ Enables offline development
- ✅ Makes tests fast and reliable
- ✅ Avoids rate limits

**Only use a real token when:**
- Testing final integration before deployment
- Debugging specific API issues
- Validating production deployment

### Running Tests

**Frontend:**
```bash
cd frontend
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
```

**Backend:**
```bash
cd backend
npm test              # All tests use mocks - no real API calls!
```

**Note**: All tests are designed to work without real API calls. They use mocks and fixtures to simulate Replicate API responses.

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm run build
```

## Deployment

### Backend Deployment (AWS Lambda)

1. Configure AWS credentials
2. Deploy using Serverless Framework:
```bash
cd backend
npm run deploy
```

This will output your API Gateway URL.

### Frontend Deployment (AWS Amplify)

**Option 1: Amplify Console (Recommended)**
1. Connect your GitHub repository to Amplify Console
2. Configure build settings using `amplify.yml`
3. Set environment variable: `VITE_API_GATEWAY_URL`
4. Deploy automatically on git push

**Option 2: Amplify CLI**
```bash
cd frontend
amplify init
amplify publish
```

## Environment Variables

### Backend
- `REPLICATE_API_TOKEN`: Your Replicate API token
- `NODE_ENV`: Environment (development/production)
- `AWS_REGION`: AWS region for deployment

### Frontend
- `VITE_API_GATEWAY_URL`: Backend API Gateway URL

## API Endpoints

- `POST /api/generate` - Generate 4 icons
- `GET /api/styles` - Get available style presets

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS 4, Axios
- **Backend**: Node.js 22.x (ES modules), TypeScript, AWS Lambda, Serverless Framework 4
- **Testing**: Vitest, React Testing Library, fast-check (property-based testing)
- **Deployment**: AWS Amplify (frontend), AWS Lambda + API Gateway (backend)

## Detailed Documentation

For comprehensive documentation on specific topics, see:

- **[Backend Documentation](backend/README.md)** - Lambda function structure, API endpoints, deployment, environment variables, troubleshooting, cost estimation
- **[Frontend Documentation](frontend/README.md)** - Component architecture, testing strategy, deployment to Amplify, environment configuration, troubleshooting

## Troubleshooting

### Common Issues

**Backend won't start locally:**
- Check if port 3000 is available: `lsof -i :3000`
- Ensure dependencies are installed: `cd backend && npm install`
- Verify `.env` file exists with `REPLICATE_API_TOKEN`

**Frontend can't connect to backend:**
- Verify backend is running at `http://localhost:3000`
- Check `VITE_API_GATEWAY_URL` in `frontend/.env`
- Restart frontend dev server after changing `.env`

**Tests failing:**
- Run `npm run build` in backend to compile TypeScript
- Ensure all dependencies are installed
- Check that you're using Node.js 22.x: `node --version`

**Deployment issues:**
- Verify AWS credentials: `aws sts get-caller-identity`
- Check IAM permissions for Lambda, API Gateway, CloudFormation
- Ensure backend builds successfully before deploying

For more detailed troubleshooting, see:
- [Backend Troubleshooting](backend/README.md#troubleshooting)
- [Frontend Troubleshooting](frontend/README.md#troubleshooting)

## Cost Estimation

### AWS Free Tier

- **Lambda**: 1M requests/month + 400,000 GB-seconds compute
- **API Gateway**: 1M API calls/month
- **Amplify**: 1,000 build minutes/month + 15 GB served/month

### After Free Tier

- **Lambda**: ~$0.20 per 1M requests
- **API Gateway**: ~$1.00 per 1M requests
- **Amplify**: $0.01/build minute + $0.15/GB served
- **Replicate API**: Variable (main cost driver)

**Estimated monthly cost for demo usage**: < $5 (mostly Replicate API costs)

For detailed cost breakdown, see [Backend Documentation](backend/README.md#cost-estimation).

## License

ISC
