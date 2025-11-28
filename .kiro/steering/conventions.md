# Development Conventions

## Code Style

### TypeScript
- Use strict mode (`"strict": true` in tsconfig.json)
- Prefer explicit types over `any`
- Use interfaces for object shapes, types for unions/intersections
- Enable all recommended linting rules

### Module System
- **Always use ES modules** (`import/export`) for both frontend and backend
- Never use CommonJS (`require/module.exports`) in new code
- Backend handlers should export named `handler` function: `export const handler = async (event) => { ... }`
- Use `.mjs` extension or `"type": "module"` in package.json

### Async/Await
- Prefer `async/await` over Promise chains
- Use top-level `await` in Lambda initialization when needed
- Always handle errors with try/catch blocks
- Return meaningful error messages

## Documentation Usage

### Always Verify with Official Sources

Before implementing any feature or using any API:

1. **Check official documentation first**
2. **Use MCP tools for up-to-date information**:
   - `aws-docs` - AWS service documentation
   - `context7` - Library and framework docs
   - `llms.text` - Project-specific documentation
3. **Verify runtime compatibility** (Node.js 22.x for Lambda in this project)
4. **Check for deprecation notices**

### Don't Trust Without Verification
- ❌ Stack Overflow answers (may be outdated)
- ❌ Blog posts older than 1 year
- ❌ ChatGPT/AI responses without source verification
- ❌ Code examples without checking current API

### Do Trust
- ✅ Official AWS documentation (docs.aws.amazon.com)
- ✅ Official library documentation (via MCP or direct links)
- ✅ Current GitHub repositories (check latest releases)
- ✅ Official migration guides

## Error Handling

### Lambda Functions
```typescript
export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    // Business logic
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    };
  }
};
```

### Frontend Components
```typescript
try {
  const response = await axios.post('/api/generate', data);
  // Handle success
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Handle API errors
    console.error('API Error:', error.response?.data);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

## Testing

### Frontend Tests
- Use Vitest with React Testing Library
- Write property-based tests with fast-check for complex logic
- Test user interactions, not implementation details
- Mock external API calls

### Backend Tests
- Test Lambda handlers with sample events
- Mock external services (Replicate API, S3)
- Test error scenarios
- Verify response format

## Environment Variables

### Security
- Never commit `.env` files
- Always provide `.env.example` templates
- Use AWS Secrets Manager for production secrets
- Validate required environment variables at startup

### Naming
- Use `SCREAMING_SNAKE_CASE` for environment variables
- Prefix frontend variables with `VITE_`
- Document all variables in `.env.example`

## Git Workflow

### Commit Messages
- Use conventional commits format
- Examples:
  - `feat: add icon generation endpoint`
  - `fix: handle empty prompt error`
  - `docs: update API documentation`
  - `refactor: migrate to ES modules`

### Branch Strategy
- `main` - production-ready code
- `develop` - integration branch
- `feature/*` - new features
- `fix/*` - bug fixes
