# Backend - Icon Set Generator API

AWS Lambda functions for icon generation via Replicate API.

## Architecture

- **Runtime**: Node.js 22.x (ES modules)
- **Framework**: Serverless Framework 4
- **API**: AWS API Gateway (HTTP API with CORS)
- **Functions**:
  - `generateIcons` - Generate 4 icons (5 min timeout, 1024 MB)
  - `getStyles` - Return style presets (30 sec timeout, 512 MB)

## Development

### Prerequisites

- Node.js 22.x or higher
- AWS Account (for deployment only)

### Setup

```bash
npm install
cp .env.example .env
# Edit .env: REPLICATE_API_TOKEN=mock-token-for-development
npm run build
```

### Local Development

```bash
npm run dev
# API runs at http://localhost:3000
```

**Endpoints:**
- `GET http://localhost:3000/api/styles`
- `POST http://localhost:3000/api/generate`

**Test with curl:**
```bash
curl http://localhost:3000/api/styles

curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"toys","style":"pastels"}'
```

### Testing

All tests use mocks - no real API calls:

```bash
npm test              # Run once
npm run test:watch    # Watch mode
```

## Deployment

### Deploy to AWS

1. **Configure AWS credentials:**
```bash
aws configure
```

2. **Deploy:**
```bash
npm run deploy        # Dev stage
npm run deploy:prod   # Production stage
```

**Output:**
```
endpoints:
  POST - https://abc123.execute-api.us-east-1.amazonaws.com/api/generate
  GET - https://abc123.execute-api.us-east-1.amazonaws.com/api/styles
```

Use this URL as `VITE_API_GATEWAY_URL` in frontend.

### Environment Variables

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REPLICATE_API_TOKEN` | Replicate API authentication token | `r8_...` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `AWS_REGION` | AWS deployment region | `us-east-1` |

#### Local Development

For local development, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Use `REPLICATE_API_TOKEN=mock-token-for-development` for local testing. All tests use mocks, so no real API token is needed.

#### Production: AWS Systems Manager Parameter Store (Recommended)

For production deployments, store sensitive values in AWS Systems Manager Parameter Store instead of environment variables.

**Benefits:**
- Centralized secret management
- Automatic encryption at rest
- Access control via IAM policies
- Audit logging of secret access
- No secrets in deployment artifacts

**Setup Instructions:**

1. **Store the secret in Parameter Store:**
```bash
aws ssm put-parameter \
  --name "/icon-generator/replicate-api-token" \
  --value "your-actual-replicate-token-here" \
  --type "SecureString" \
  --description "Replicate API token for icon generation"
```

2. **Update serverless.yml to reference the parameter:**
```yaml
provider:
  environment:
    REPLICATE_API_TOKEN: ${ssm:/icon-generator/replicate-api-token}
```

3. **Grant Lambda execution role permission to read the parameter:**

The Serverless Framework automatically creates an IAM role for your Lambda functions. To grant access to Parameter Store, add this to `serverless.yml`:

```yaml
provider:
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - ssm:GetParameter
            - ssm:GetParameters
          Resource: 
            - arn:aws:ssm:${aws:region}:${aws:accountId}:parameter/icon-generator/*
```

4. **Deploy:**
```bash
npm run deploy
```

The Lambda function will automatically fetch the token from Parameter Store at deployment time.

**Alternative: Runtime Fetching**

If you prefer to fetch the parameter at runtime (for automatic rotation support):

```typescript
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssm = new SSMClient({ region: process.env.AWS_REGION });

async function getReplicateToken(): Promise<string> {
  const command = new GetParameterCommand({
    Name: "/icon-generator/replicate-api-token",
    WithDecryption: true
  });
  
  const response = await ssm.send(command);
  return response.Parameter?.Value || '';
}
```

**Cost:**
- Parameter Store: Free for standard parameters
- Advanced parameters: $0.05 per parameter/month

#### Production: AWS Secrets Manager (Alternative)

For more advanced secret management features:

```bash
# Store secret
aws secretsmanager create-secret \
  --name icon-generator/replicate-token \
  --secret-string "your-actual-token-here"

# Reference in serverless.yml
provider:
  environment:
    REPLICATE_API_TOKEN: ${ssm:/aws/reference/secretsmanager/icon-generator/replicate-token}
```

**Benefits over Parameter Store:**
- Automatic secret rotation
- Cross-region replication
- Fine-grained access control

**Cost:**
- $0.40 per secret/month + $0.05 per 10,000 API calls

#### Verifying Environment Variables

After deployment, verify environment variables are set:

```bash
# View deployed function configuration
serverless info --verbose

# Or use AWS CLI
aws lambda get-function-configuration \
  --function-name icon-generator-api-dev-generateIcons \
  --query 'Environment'
```

### Useful Commands

```bash
npm run info          # View deployment info
npm run logs          # View function logs (tail)
npm run remove        # Remove deployment

serverless deploy --stage prod              # Deploy to stage
serverless deploy function -f generateIcons # Deploy single function
serverless invoke local -f getStyles        # Invoke locally
```

## Project Structure

```
src/
├── handlers/              # Lambda handlers
│   ├── generate.ts        # Icon generation (5 min timeout)
│   ├── getStyles.ts       # Style presets (30 sec timeout)
│   ├── errorHandler.ts    # Error utilities
│   └── utils.ts           # Handler utilities
├── services/              # Business logic
│   ├── replicate.ts       # Replicate API client
│   └── imageValidator.ts  # Image validation
├── constants/
│   └── stylePresets.ts    # 5 style definitions
├── types/
│   └── index.ts           # TypeScript types
└── __fixtures__/          # Test fixtures (mocked responses)
```

## API Endpoints

### POST /api/generate

Generate 4 themed icons.

**Request:**
```json
{
  "prompt": "toys",
  "style": "pastels",
  "brandColors": ["#FF5733"]  // optional
}
```

**Response:**
```json
{
  "success": true,
  "icons": [
    { "id": "1", "url": "https://...", "prompt": "toys", "style": "pastels" },
    // ... 3 more
  ]
}
```

### GET /api/styles

Get available style presets.

**Response:**
```json
{
  "styles": [
    { "id": "pastels", "name": "Pastels", "description": "Soft, muted colors..." },
    // ... 4 more
  ]
}
```

## Cost Estimation

**AWS Free Tier:**
- Lambda: 1M requests/month + 400,000 GB-seconds
- API Gateway: 1M calls/month

**After free tier:**
- Lambda: $0.20 per 1M requests
- API Gateway: $1.00 per 1M requests

**Estimated cost for demo:** < $5/month (mostly Replicate API)

## Troubleshooting

**"Module not found" errors**
→ Run `npm run build`

**Serverless offline not starting**
→ Check port 3000: `lsof -i :3000`

**Deployment fails**
→ Verify AWS credentials: `aws sts get-caller-identity`
→ Check IAM permissions (Lambda, API Gateway, CloudFormation)
→ Ensure `dist/` exists: `npm run build`

**Lambda timeout errors**
→ Check Replicate API status
→ Review CloudWatch logs: `npm run logs`

## Monitoring

View logs:
```bash
npm run logs  # Tail logs in terminal
```

Or in AWS Console:
- CloudWatch → Log Groups → `/aws/lambda/icon-generator-api-dev-generateIcons`

## Security Best Practices

- Never commit `.env` files
- Use AWS Secrets Manager for production tokens
- Configure specific CORS origins in production (not `*`)
- Enable API Gateway throttling
- Use IAM roles with least privilege

## Resources

- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [AWS Lambda Node.js Docs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html)
- [Replicate API Docs](https://replicate.com/docs)
