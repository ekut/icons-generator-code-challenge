---
inclusion: always
---

# Testing Guidelines

## Critical Rule: Mock External APIs

**NEVER make real API calls during testing or development.**

### Replicate API Mocking

All code that interacts with the Replicate API MUST be tested with mocks:

```typescript
// ❌ BAD - Real API call in test
test('generates icon', async () => {
  const service = new ReplicateService(process.env.REPLICATE_API_TOKEN!);
  const result = await service.generateIcon('toys', style); // Real API call!
});

// ✅ GOOD - Mocked API call
import { vi } from 'vitest';

test('generates icon', async () => {
  const service = new ReplicateService('mock-token');
  const mockRun = vi.spyOn(service['client'], 'run').mockResolvedValue([
    'https://example.com/mock-image.png'
  ]);
  
  const result = await service.generateIcon('toys', style);
  expect(result).toBe('https://example.com/mock-image.png');
  expect(mockRun).toHaveBeenCalledOnce();
});
```

### Testing Strategy

1. **Unit Tests**: Always mock external dependencies
   - Mock Replicate API client
   - Mock file system operations
   - Mock network requests

2. **Integration Tests**: Use mock servers or fixtures
   - Create mock HTTP servers for API testing
   - Use recorded responses (fixtures)
   - Never hit real external APIs

3. **E2E Tests**: Only when absolutely necessary
   - Mark clearly as E2E tests
   - Skip by default in CI/CD
   - Require explicit flag to run
   - Document API usage in test output

### Mock Data

Create reusable mock data in test fixtures:

```typescript
// backend/src/__fixtures__/replicate-responses.ts
export const mockIconUrl = 'https://replicate.delivery/mock/image.png';
export const mockReplicateOutput = [mockIconUrl];
export const mockReplicateError = {
  status: 500,
  message: 'Service unavailable'
};
```

### Local Development

- Backend should work with `REPLICATE_API_TOKEN=mock-token-for-dev`
- Implement a "mock mode" that returns fake images
- Use environment variable to toggle between real/mock API

### When Real API Calls Are Acceptable

Only in these scenarios:
1. Final integration testing before deployment
2. Debugging specific API issues
3. Validating new API features

Always:
- Document the reason in commit message
- Use a dedicated test account/token
- Limit the number of calls
- Clean up generated resources

## Property-Based Testing

When writing property tests with fast-check:
- Generate test data, not API calls
- Test business logic, not external services
- Mock any external dependencies

```typescript
// ✅ GOOD - Tests prompt construction without API calls
fc.assert(
  fc.property(
    fc.string({ minLength: 1 }),
    fc.array(fc.hexaString({ minLength: 6, maxLength: 6 })),
    (prompt, colors) => {
      const service = new ReplicateService('mock-token');
      const result = service['buildPrompt'](prompt, style, colors);
      
      expect(result).toContain(prompt);
      colors.forEach(color => expect(result).toContain(color));
    }
  )
);
```

## Running Tests

### Correct Test Commands

**IMPORTANT**: Use the correct npm test command for this project:

```bash
# ✅ CORRECT - Run tests once
npm test

# ❌ WRONG - This causes "Expected a single value for option --run" error
npm test -- --run
```

The `package.json` already includes `--run` flag in the test script:
```json
{
  "scripts": {
    "test": "vitest --run"
  }
}
```

Adding `-- --run` duplicates the flag and causes an error.

### Test Commands by Context

- **Backend tests**: `cd backend && npm test`
- **Frontend tests**: `cd frontend && npm test`
- **Watch mode** (for development): `npm run test:watch` (if configured)

## Cost Awareness

Remember:
- Each Replicate API call costs money
- API tokens have rate limits
- Unnecessary calls slow down development
- Tests should be fast and repeatable

**When in doubt, mock it out!**
