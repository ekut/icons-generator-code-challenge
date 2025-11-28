# Design Document

## Overview

The Icon Set Generator is a web application built with Node.js, React, and TypeScript that generates consistent sets of 4 themed icons using the Replicate API's FLUX-schnell model. The application provides an intuitive interface for users to input prompts, select style presets, optionally specify brand colors, and download the generated icons.

The system architecture follows a client-server pattern with clear separation between the React frontend, Node.js backend API layer, and external Replicate API integration.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   AWS Amplify (Frontend)                     │
│              React SPA + CloudFront CDN                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Input Form   │  │ Style        │  │ Icon Grid    │      │
│  │ Component    │  │ Selector     │  │ Component    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (REST API)                    │
│              https://api-id.execute-api.region.aws.com       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   AWS Lambda Functions                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Generate     │  │ Get Styles   │  │ Error        │      │
│  │ Handler      │  │ Handler      │  │ Handler      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Replicate API                           │
│                   (FLUX-schnell Model)                       │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React 19 with TypeScript
- **Frontend Hosting**: AWS Amplify (with CloudFront CDN)
- **Backend**: AWS Lambda (Node.js 22.x runtime with ES modules)
- **API Gateway**: AWS API Gateway (HTTP API with CORS)
- **Deployment**: Serverless Framework 4 (for Lambda), Amplify Console (for frontend)
- **API Client**: Replicate Node.js SDK
- **Build Tool**: Vite 7 (chosen for faster builds, better HMR, and optimized production bundles)
- **Testing**: Vitest (for unit tests), fast-check (for property-based tests), React Testing Library
- **Styling**: Tailwind CSS 4 (for rapid development and responsive design)
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Axios (for better error handling and interceptors)
- **Module System**: ES modules for both frontend and backend (`.mjs` files or `"type": "module"` in package.json)

## Components and Interfaces

### Frontend Components

#### 1. App Component
- Root component managing application state
- Coordinates communication between child components
- Manages generation workflow

#### 2. PromptInput Component
```typescript
interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}
```

#### 3. StyleSelector Component
```typescript
interface StyleSelectorProps {
  styles: StylePreset[];
  selectedStyle: string | null;
  onSelect: (styleId: string) => void;
}

interface StylePreset {
  id: string;                    // Unique identifier (e.g., 'pastels', 'bubbles')
  name: string;                  // Display name (e.g., 'Pastels', 'Bubbles')
  description: string;           // User-facing description of the style
  thumbnail?: string;            // Optional: URL to preview image showing the style
}
```

#### 4. ColorInput Component
```typescript
interface ColorInputProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  maxColors?: number;
}
```

#### 5. IconGrid Component
```typescript
interface IconGridProps {
  icons: GeneratedIcon[];
  loading: boolean;
  onDownload: (iconId: string) => void;
  onDownloadAll: () => void;
}

interface GeneratedIcon {
  id: string;
  url: string;
  prompt: string;
  style: string;
}
```

#### 6. LoadingSpinner Component
```typescript
interface LoadingSpinnerProps {
  message?: string;
}
```

### Backend Lambda Functions

#### Lambda Handler: generateIcons
**Trigger**: API Gateway POST /api/generate

```typescript
interface GenerateRequest {
  prompt: string;
  style: string;
  brandColors?: string[];
}

interface GenerateResponse {
  success: boolean;
  icons?: GeneratedIcon[];
  error?: string;
}

// ES module export for Lambda
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Parse request body
  // Validate inputs
  // Generate 4 icons in parallel
  // Return response
};
```

**Note:** Lambda handlers use ES module syntax (`export const handler`) rather than CommonJS (`module.exports`). This enables top-level await and aligns with modern JavaScript standards.

#### Lambda Handler: getStyles
**Trigger**: API Gateway GET /api/styles

```typescript
interface StylesResponse {
  styles: StylePreset[];
}

// ES module export for Lambda
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Return predefined style presets
};
```

### Replicate API Integration

#### ReplicateService Class
```typescript
class ReplicateService {
  private client: Replicate;
  
  constructor(apiToken: string);
  
  async generateIcon(
    prompt: string,
    style: StylePreset,
    brandColors?: string[]
  ): Promise<string>;
  
  private buildPrompt(
    userPrompt: string,
    style: StylePreset,
    brandColors?: string[]
  ): string;
  
  private async pollForResult(predictionId: string): Promise<string>;
}
```

## Data Models

### StylePreset
```typescript
interface StylePreset {
  id: string;                    // Unique identifier for the style
  name: string;                  // Display name shown to users
  description: string;           // Description of the visual style
  promptModifiers: string[];     // Keywords added to AI prompts to achieve this style
                                 // Example: ['pastel colors', 'soft lighting']
  thumbnail?: string;            // Optional preview image URL
}
```

### GenerationRequest
```typescript
interface GenerationRequest {
  prompt: string;
  styleId: string;
  brandColors: string[];
  timestamp: number;
}
```

### GeneratedIcon
```typescript
interface GeneratedIcon {
  id: string;
  url: string;
  prompt: string;
  style: string;
  generatedAt: number;
}
```

### APIError
```typescript
interface APIError {
  code: string;
  message: string;
  details?: any;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Prompt Storage Consistency
*For any* valid non-empty prompt entered by the user, the system should store and use that exact prompt in the generation request without modification.
**Validates: Requirements 1.4**

### Property 2: Style Selection State
*For any* style preset selected by the user, the system should highlight that style and use it in the generation request.
**Validates: Requirements 2.2, 2.3**

### Property 3: HEX Color Validation
*For any* string input as a color code, the system should correctly validate whether it matches HEX format (#RRGGBB or #RGB) and display errors for invalid formats while accepting valid ones.
**Validates: Requirements 3.2, 3.3**

### Property 4: Color Parameter Inclusion
*For any* valid HEX color codes provided, the system should include all provided colors in the generation parameters sent to the API.
**Validates: Requirements 3.4**

### Property 5: Icon Set Cardinality
*For any* successful generation request, the system should produce exactly 4 icons, no more and no less.
**Validates: Requirements 4.1**

### Property 6: Loading State Visibility
*For any* generation request initiated, the system should display a loading indicator until the generation completes or fails.
**Validates: Requirements 4.2**

### Property 7: Success State Display
*For any* successful generation, the system should display all 4 generated icons in the grid layout.
**Validates: Requirements 4.3**

### Property 8: Error State Handling
*For any* failed generation request, the system should display an error message and provide a retry option.
**Validates: Requirements 4.4, 8.3, 9.3**

### Property 9: Icon Uniqueness
*For any* generated icon set, all 4 icons should have different image URLs, ensuring they are distinct images.
**Validates: Requirements 4.5**

### Property 10: Image Resolution Invariant
*For any* generated icon, the image dimensions should be exactly 512x512 pixels.
**Validates: Requirements 5.1**

### Property 11: Image Format Invariant
*For any* generated icon, the file format should be PNG (with optional JPG export for downloads).
**Validates: Requirements 5.2**

### Property 12: Download Availability
*For any* successfully generated icon set, download buttons should be available for each individual icon.
**Validates: Requirements 6.1, 6.2**

### Property 13: Filename Descriptiveness
*For any* downloaded icon, the filename should contain both the prompt text and style name.
**Validates: Requirements 6.4**

### Property 14: API Endpoint Correctness
*For any* API request to Replicate, the system should use the FLUX-schnell model endpoint and include the API token in the authorization header.
**Validates: Requirements 7.1, 7.2**

### Property 15: Prompt Construction Completeness
*For any* generation request, the constructed prompt sent to the API should include the user prompt, style-specific descriptors, and any provided brand colors.
**Validates: Requirements 7.3, 10.1, 10.3**

### Property 16: API Response Handling
*For any* API response received (success or error), the system should handle it appropriately without crashing.
**Validates: Requirements 7.4**

### Property 17: Retry Logic for Transient Failures
*For any* transient API failure (network timeout, 5xx errors), the system should automatically retry the request up to a maximum number of attempts.
**Validates: Requirements 9.4**

### Property 18: Style Parameter Consistency
*For any* icon set generation, all 4 API requests should use identical style parameters and brand colors.
**Validates: Requirements 10.2**

## Error Handling

### Error Categories

1. **Validation Errors**
   - Empty prompt
   - Invalid HEX color format
   - Missing style selection
   - Response: Display inline error messages, prevent submission

2. **API Errors**
   - Authentication failures (401)
   - Rate limiting (429)
   - Server errors (5xx)
   - Network timeouts
   - Response: Display user-friendly error messages, offer retry

3. **Generation Errors**
   - Incomplete icon set (< 4 icons generated)
   - Invalid image format returned
   - Image download failures
   - Response: Display error, allow retry with same parameters

4. **Client Errors**
   - Network connectivity issues
   - Browser compatibility issues
   - Response: Display appropriate error messages

### Error Handling Strategy

```typescript
class ErrorHandler {
  static handle(error: Error): UserFacingError {
    if (error instanceof ValidationError) {
      return {
        type: 'validation',
        message: error.message,
        recoverable: true
      };
    }
    
    if (error instanceof APIError) {
      if (error.status === 429) {
        return {
          type: 'rate_limit',
          message: 'Rate limit exceeded. Please try again in a moment.',
          recoverable: true,
          retryAfter: error.retryAfter
        };
      }
      
      if (error.status >= 500) {
        return {
          type: 'server_error',
          message: 'Service temporarily unavailable. Please try again.',
          recoverable: true
        };
      }
    }
    
    return {
      type: 'unknown',
      message: 'An unexpected error occurred. Please try again.',
      recoverable: true
    };
  }
}
```

## Testing Strategy

### Unit Testing

The application will use **Vitest** for unit testing and **React Testing Library** for component testing.

**Unit Test Coverage:**
- Component rendering and user interactions
- Form validation logic
- Prompt construction logic
- Error handling functions
- API client methods (with mocked Replicate SDK)
- Utility functions (HEX validation, filename generation)

**Example Unit Tests:**
- Test that PromptInput component validates empty input
- Test that StyleSelector highlights selected style
- Test that ColorInput validates HEX format
- Test that API client constructs correct request payload
- Test that error handler returns appropriate messages

**Rationale for Vitest:**
- Native ES module support (aligns with project's module system)
- Vite-powered for faster test execution
- Compatible API with Jest for easy migration
- Better TypeScript integration

### Property-Based Testing

The application will use **fast-check** (JavaScript/TypeScript property-based testing library) for property-based tests.

**Property Test Configuration:**
- Each property-based test will run a minimum of 100 iterations
- Tests will use fast-check's built-in generators and custom generators for domain-specific data
- Each property-based test will be tagged with a comment referencing the design document property

**Property Test Coverage:**
- Prompt storage and retrieval (Property 1)
- HEX color validation with random strings (Property 3)
- Icon set cardinality across various inputs (Property 5)
- Icon uniqueness verification (Property 9)
- Image dimension verification (Property 10)
- Filename generation with various prompts and styles (Property 13)
- Prompt construction with random inputs (Property 15)
- Style parameter consistency (Property 18)

**Test Tagging Format:**
```typescript
// Feature: icon-set-generator, Property 3: HEX Color Validation
test('validates HEX color format correctly', () => {
  fc.assert(
    fc.property(fc.string(), (input) => {
      const isValid = validateHexColor(input);
      const expectedValid = /^#([0-9A-F]{3}){1,2}$/i.test(input);
      expect(isValid).toBe(expectedValid);
    }),
    { numRuns: 100 }
  );
});
```

### Integration Testing

- Test complete generation workflow from form submission to icon display
- Test API integration with mocked Replicate responses
- Test error scenarios with simulated API failures
- Test download functionality

### Test Generators

Custom generators will be created for:
- Valid prompts (strings of varying lengths)
- Style preset selections
- Valid and invalid HEX color codes
- API response payloads (success and error cases)

## Implementation Notes

### Style Presets Configuration

The 5 style presets will be configured as:

```typescript
const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'pastels',
    name: 'Pastels',
    description: 'Soft, muted colors with gentle gradients',
    // promptModifiers: Keywords that will be injected into the AI prompt
    // to guide the image generation toward this visual style
    promptModifiers: ['pastel colors', 'soft lighting', 'gentle gradients', 'minimalist']
  },
  {
    id: 'bubbles',
    name: 'Bubbles',
    description: 'Glossy, bubble-like appearance with reflections',
    // These modifiers tell the AI to create glossy, 3D bubble-like icons
    promptModifiers: ['glossy', 'bubble style', 'reflective', 'translucent', '3D']
  },
  {
    id: 'flat',
    name: 'Flat',
    description: 'Clean, flat design with solid colors',
    // These modifiers create flat, 2D vector-style icons
    promptModifiers: ['flat design', 'solid colors', 'minimalist', 'vector style']
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'Vibrant gradients and color transitions',
    // These modifiers emphasize colorful gradients
    promptModifiers: ['gradient', 'vibrant colors', 'color transitions', 'modern']
  },
  {
    id: 'outline',
    name: 'Outline',
    description: 'Line-based icons with minimal fill',
    // These modifiers create line-art style icons
    promptModifiers: ['outline style', 'line art', 'minimal', 'stroke-based']
  }
];
```

**Explanation:**
- **thumbnail**: An optional field that could contain a URL to a sample image showing what icons in this style look like. This helps users preview the style before selecting it. In the initial implementation, this can be omitted.
- **promptModifiers**: An array of keywords that get added to the user's prompt when sending it to the AI. For example, if a user enters "toys" and selects "Pastels" style, the final prompt becomes: "A simple, clean icon of toys, pastel colors, soft lighting, gentle gradients, minimalist, 512x512 pixels..."

### Prompt Construction Strategy

The system will construct prompts for the FLUX-schnell model using this template:

```
"A simple, clean icon of {user_prompt}, {style_modifiers}, 512x512 pixels, icon design, centered, white background{color_instruction}"
```

Where:
- `{user_prompt}` is the user's input
- `{style_modifiers}` are the style-specific descriptors joined with commas
- `{color_instruction}` is optional: ", using colors {hex_colors}" if brand colors are provided

### API Rate Limiting and Retry Logic

```typescript
class ReplicateClient {
  private maxRetries = 3;
  private retryDelay = 1000; // ms
  
  async generateWithRetry(prompt: string): Promise<string> {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await this.generate(prompt);
      } catch (error) {
        if (this.isTransientError(error) && attempt < this.maxRetries - 1) {
          await this.delay(this.retryDelay * Math.pow(2, attempt));
          continue;
        }
        throw error;
      }
    }
  }
  
  private isTransientError(error: any): boolean {
    return error.status >= 500 || error.code === 'ETIMEDOUT';
  }
}
```

### Security Considerations

- API token stored in environment variables, never exposed to client
- All API calls proxied through backend to protect credentials
- Input sanitization for prompts to prevent injection attacks
- CORS configuration to restrict API access
- Rate limiting on backend endpoints to prevent abuse

### Performance Optimizations

- Parallel generation of 4 icons using Promise.all()
- Image caching on client side
- Lazy loading of generated images
- Debouncing of form inputs
- Optimistic UI updates where appropriate

## Deployment Architecture

### AWS Serverless Deployment

**Frontend: AWS Amplify**
- Automatic deployment from Git repository
- Built-in CloudFront CDN distribution
- SSL certificates automatically provisioned
- Environment variable management through Amplify Console
- Preview deployments for pull requests

**Backend: AWS Lambda + API Gateway (via Serverless Framework)**
- Serverless Framework manages Lambda deployment
- API Gateway automatically configured
- Environment variables stored in AWS Systems Manager Parameter Store or Lambda environment
- Automatic scaling based on request volume
- Pay-per-use pricing model

### Environment Variables

**Backend (Lambda):**
```
REPLICATE_API_TOKEN=<your-replicate-api-token>
NODE_ENV=production
AWS_REGION=us-east-1
```

**Note:** Never commit actual API tokens. Use AWS Secrets Manager or Systems Manager Parameter Store for production deployments.

**Frontend (Amplify):**
```
VITE_API_GATEWAY_URL=https://api-id.execute-api.us-east-1.amazonaws.com/prod
```

### Serverless Framework Configuration

**backend/serverless.yml:**
```yaml
service: icon-generator-api

provider:
  name: aws
  runtime: nodejs22.x  # Latest LTS with ES module support
  region: us-east-1
  stage: ${opt:stage, 'dev'}
  environment:
    REPLICATE_API_TOKEN: ${env:REPLICATE_API_TOKEN}
    NODE_ENV: production

functions:
  generateIcons:
    handler: src/handlers/generate.handler
    timeout: 300  # 5 minutes for image generation
    events:
      - httpApi:
          path: /api/generate
          method: post
          cors: true
  
  getStyles:
    handler: src/handlers/getStyles.handler
    events:
      - httpApi:
          path: /api/styles
          method: get
          cors: true

plugins:
  - serverless-plugin-typescript
  - serverless-offline  # For local development
```

**Rationale for Node.js 22.x:**
- Latest LTS version with improved performance
- Native ES module support with top-level await
- Better TypeScript compatibility
- Consistent with modern JavaScript standards

### Amplify Configuration

**frontend/amplify.yml:**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Deployment Process

**Backend Deployment:**
```bash
cd backend
npm install
npx serverless deploy --stage prod
# Outputs API Gateway URL
```

**Frontend Deployment:**
1. Connect GitHub repository to Amplify Console
2. Configure build settings (amplify.yml)
3. Set environment variables (API Gateway URL)
4. Automatic deployment on git push

**Alternative Frontend Deployment (CLI):**
```bash
cd frontend
npm install
amplify init
amplify publish
```

### Project Structure

```
icon-set-generator/
├── frontend/                    # AWS Amplify
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── amplify.yml             # Amplify build config
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                     # AWS Lambda
│   ├── src/
│   │   ├── handlers/
│   │   │   ├── generate.ts     # Lambda handler
│   │   │   └── getStyles.ts    # Lambda handler
│   │   ├── services/
│   │   │   └── replicate.ts
│   │   └── types/
│   ├── serverless.yml          # Serverless Framework config
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example
└── README.md
```

### Cost Estimation

- **Lambda**: Free tier includes 1M requests/month + 400,000 GB-seconds compute
- **API Gateway**: Free tier includes 1M API calls/month
- **Amplify**: $0.01 per build minute, $0.15 per GB served
- **CloudFront**: Included with Amplify
- **Estimated monthly cost for demo**: < $5 (mostly Replicate API costs)

## Module System Architecture

### Why ES Modules?

The project uses ES modules throughout for consistency and modern JavaScript standards:

**Backend (Lambda):**
- AWS Lambda recommends ES modules for Node.js 22.x
- Enables top-level `await` during initialization
- Better tree-shaking and optimization
- Consistent with frontend module system
- Use `export const handler` instead of `module.exports`

**Frontend (Vite):**
- Vite requires ES modules
- Native browser support for modern bundling
- Faster HMR (Hot Module Replacement)
- Use `import/export` syntax throughout

**Configuration:**
- Set `"type": "module"` in package.json, OR
- Use `.mjs` file extensions for compiled output
- TypeScript compiles to ES modules via tsconfig.json

## Future Enhancements

- Save generation history
- User accounts and saved presets
- Batch generation of multiple icon sets
- Custom style creation
- Icon editing capabilities
- Export in multiple formats (SVG, JPG)
- API usage tracking and cost monitoring
