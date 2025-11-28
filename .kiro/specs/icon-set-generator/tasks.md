# Implementation Plan

- [ ] 1. Set up project structure and dependencies
  - Create separate frontend/ and backend/ folders
  - Initialize frontend with Vite + React + TypeScript
  - Initialize backend with Node.js + TypeScript
  - Install frontend dependencies (React, Axios, Tailwind CSS, fast-check, Vitest, React Testing Library)
  - Install backend dependencies (Replicate SDK, Serverless Framework, serverless-plugin-typescript, serverless-offline)
  - Configure TypeScript for both frontend and backend
  - Configure Tailwind CSS (tailwind.config.js, postcss.config.js)
  - Set up environment variables configuration (.env files)
  - Create serverless.yml for Lambda deployment
  - Create amplify.yml for Amplify deployment
  - _Requirements: 9.1, 9.2_

- [ ] 2. Implement backend Lambda functions foundation
  - [ ] 2.1 Create Lambda handler structure
    - Set up handler files (generate.ts, getStyles.ts)
    - Configure API Gateway event types
    - Implement response formatting utilities
    - Add CORS headers to responses
    - _Requirements: 9.1_

  - [ ] 2.2 Implement Replicate API client service
    - Create ReplicateService class
    - Implement authentication with API token
    - Create method for single icon generation
    - Implement prompt construction logic
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 2.3 Write property test for prompt construction
    - **Property 15: Prompt Construction Completeness**
    - **Validates: Requirements 7.3, 10.1, 10.3**

  - [ ] 2.4 Implement retry logic for API calls
    - Add exponential backoff retry mechanism
    - Handle transient failures (5xx, timeouts)
    - Configure maximum retry attempts
    - _Requirements: 9.4_

  - [ ] 2.5 Write property test for retry logic
    - **Property 17: Retry Logic for Transient Failures**
    - **Validates: Requirements 9.4**

  - [ ] 2.6 Create error handling utilities
    - Implement ErrorHandler class
    - Map API errors to user-friendly messages
    - Handle validation, API, and network errors
    - _Requirements: 9.3_

  - [ ] 2.7 Write unit tests for error handling
    - Test error categorization
    - Test error message generation
    - Test recoverable vs non-recoverable errors
    - _Requirements: 9.3_

- [ ] 3. Implement style presets configuration
  - [ ] 3.1 Define style presets data structure
    - Create STYLE_PRESETS constant with all 5 styles
    - Define StylePreset interface
    - Add style-specific prompt modifiers
    - _Requirements: 2.1, 10.1_

  - [ ] 3.2 Create getStyles Lambda handler
    - Return list of available style presets
    - Include style metadata (id, name, description)
    - Format as API Gateway response
    - _Requirements: 2.1_

  - [ ] 3.3 Write unit tests for getStyles Lambda handler
    - Test handler returns all 5 styles
    - Test API Gateway response format
    - Test CORS headers are included
    - _Requirements: 2.1_

- [ ] 4. Implement icon generation Lambda function
  - [ ] 4.1 Create generateIcons Lambda handler
    - Parse API Gateway event body
    - Accept prompt, style, and optional brand colors
    - Validate input parameters
    - Generate 4 icons in parallel
    - Return formatted API Gateway response with icon URLs
    - _Requirements: 4.1, 7.3_

  - [ ] 4.2 Write property test for icon set cardinality
    - **Property 5: Icon Set Cardinality**
    - **Validates: Requirements 4.1**

  - [ ] 4.3 Implement parallel icon generation
    - Use Promise.all() to generate 4 icons concurrently
    - Ensure all icons use same style parameters
    - Handle partial failures
    - _Requirements: 4.1, 10.2_

  - [ ] 4.4 Write property test for style parameter consistency
    - **Property 18: Style Parameter Consistency**
    - **Validates: Requirements 10.2**

  - [ ] 4.5 Add input validation
    - Validate prompt is non-empty
    - Validate style ID exists
    - Validate HEX color format if provided
    - _Requirements: 1.3, 3.2_

  - [ ] 4.6 Write property test for HEX color validation
    - **Property 3: HEX Color Validation**
    - **Validates: Requirements 3.2, 3.3**

- [ ] 5. Checkpoint - Ensure backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement React frontend foundation
  - [ ] 6.1 Create main App component
    - Set up component structure
    - Initialize state management
    - Create layout structure
    - _Requirements: 8.1_

  - [ ] 6.2 Implement API client service
    - Create frontend API client using Axios for backend endpoints
    - Implement error handling with Axios interceptors
    - Add request/response interceptors for API Gateway URL
    - Configure timeout and retry logic
    - _Requirements: 7.4_

  - [ ] 6.3 Write unit tests for API client
    - Test successful requests
    - Test error handling
    - Test request formatting
    - _Requirements: 7.4_

- [ ] 7. Implement form input components
  - [ ] 7.1 Create PromptInput component
    - Implement text input with validation
    - Show error messages for empty input
    - Handle onChange events
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 7.2 Write property test for prompt storage
    - **Property 1: Prompt Storage Consistency**
    - **Validates: Requirements 1.4**

  - [ ] 7.3 Write unit tests for PromptInput
    - Test rendering
    - Test validation
    - Test user input handling
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 7.4 Create StyleSelector component
    - Display all 5 style presets
    - Implement selection highlighting
    - Handle style selection changes
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 7.5 Write property test for style selection state
    - **Property 2: Style Selection State**
    - **Validates: Requirements 2.2, 2.3**

  - [ ] 7.6 Write unit tests for StyleSelector
    - Test all styles are displayed
    - Test selection highlighting
    - Test selection changes
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 7.7 Create ColorInput component
    - Implement HEX color input fields
    - Add validation for HEX format
    - Show validation errors
    - Support multiple color inputs
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 7.8 Write property test for color parameter inclusion
    - **Property 4: Color Parameter Inclusion**
    - **Validates: Requirements 3.4**

  - [ ] 7.9 Write unit tests for ColorInput
    - Test HEX validation
    - Test error display
    - Test multiple color inputs
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 8. Implement generation workflow
  - [ ] 8.1 Create generation form submission handler
    - Validate all inputs before submission
    - Prevent submission with invalid data
    - Call backend API with form data
    - _Requirements: 1.3, 2.4, 4.1_

  - [ ] 8.2 Implement loading state management
    - Show loading indicator during generation
    - Disable form during generation
    - Handle loading state transitions
    - _Requirements: 4.2_

  - [ ] 8.3 Write property test for loading state visibility
    - **Property 6: Loading State Visibility**
    - **Validates: Requirements 4.2**

  - [ ] 8.4 Create LoadingSpinner component
    - Display animated loading indicator
    - Show progress message
    - _Requirements: 4.2_

  - [ ] 8.5 Write unit tests for loading states
    - Test loading indicator appears
    - Test form is disabled during loading
    - _Requirements: 4.2_

- [ ] 9. Implement icon display and download
  - [ ] 9.1 Create IconGrid component
    - Display 4 icons in grid layout
    - Show download button for each icon
    - Handle empty/loading states
    - _Requirements: 4.3, 6.1_

  - [ ] 9.2 Write property test for success state display
    - **Property 7: Success State Display**
    - **Validates: Requirements 4.3**

  - [ ] 9.3 Write property test for icon uniqueness
    - **Property 9: Icon Uniqueness**
    - **Validates: Requirements 4.5**

  - [ ] 9.4 Write unit tests for IconGrid
    - Test grid renders 4 icons
    - Test download buttons are present
    - Test empty state
    - _Requirements: 4.3, 6.1_

  - [ ] 9.5 Implement individual icon download
    - Create download handler for single icons
    - Generate descriptive filenames
    - Trigger browser download
    - _Requirements: 6.2, 6.4_

  - [ ] 9.6 Write property test for download availability
    - **Property 12: Download Availability**
    - **Validates: Requirements 6.1, 6.2**

  - [ ] 9.7 Write property test for filename descriptiveness
    - **Property 13: Filename Descriptiveness**
    - **Validates: Requirements 6.4**

  - [ ] 9.8 Implement download all functionality
    - Create handler to download all 4 icons
    - Use descriptive filenames for each
    - _Requirements: 6.3, 6.4_

  - [ ] 9.9 Write unit tests for download functionality
    - Test individual downloads
    - Test download all
    - Test filename generation
    - _Requirements: 6.2, 6.3, 6.4_

- [ ] 10. Implement error handling UI
  - [ ] 10.1 Create error display component
    - Show user-friendly error messages
    - Display retry button for recoverable errors
    - Handle different error types
    - _Requirements: 4.4, 8.3_

  - [ ] 10.2 Write property test for error state handling
    - **Property 8: Error State Handling**
    - **Validates: Requirements 4.4, 8.3, 9.3**

  - [ ] 10.3 Implement retry functionality
    - Allow users to retry failed generations
    - Preserve form inputs on retry
    - _Requirements: 4.4_

  - [ ] 10.4 Write unit tests for error handling
    - Test error message display
    - Test retry button functionality
    - Test different error types
    - _Requirements: 4.4, 8.3_

- [ ] 11. Add image validation
  - [ ] 11.1 Implement image dimension validation
    - Verify generated images are 512x512
    - Handle invalid dimensions
    - _Requirements: 5.1_

  - [ ] 11.2 Write property test for image resolution
    - **Property 10: Image Resolution Invariant**
    - **Validates: Requirements 5.1**

  - [ ] 11.3 Implement image format validation
    - Verify images are PNG format
    - Handle invalid formats
    - _Requirements: 5.2_

  - [ ] 11.4 Write property test for image format
    - **Property 11: Image Format Invariant**
    - **Validates: Requirements 5.2**

- [ ] 12. Implement API endpoint correctness verification
  - [ ] 12.1 Write property test for API endpoint correctness
    - **Property 14: API Endpoint Correctness**
    - **Validates: Requirements 7.1, 7.2**

  - [ ] 12.2 Write property test for API response handling
    - **Property 16: API Response Handling**
    - **Validates: Requirements 7.4**

- [ ] 13. Add styling and polish with Tailwind CSS
  - [ ] 13.1 Implement responsive layout
    - Use Tailwind responsive classes (sm:, md:, lg:)
    - Make interface work on mobile and desktop
    - Adjust grid layout for different screen sizes
    - _Requirements: 8.1_

  - [ ] 13.2 Add visual feedback for interactions
    - Use Tailwind hover: and focus: variants for buttons
    - Add focus states for inputs with ring utilities
    - Implement transition animations with Tailwind transition classes
    - _Requirements: 8.2_

  - [ ] 13.3 Style form components
    - Apply Tailwind utility classes for consistent styling
    - Use Tailwind spacing utilities (p-, m-, space-)
    - Ensure accessibility with proper contrast and focus states
    - _Requirements: 8.1_

  - [ ] 13.4 Style icon grid and download buttons
    - Create attractive icon display with Tailwind grid utilities
    - Style download buttons with Tailwind button classes
    - Add hover effects using Tailwind hover: variants
    - _Requirements: 8.1_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Create deployment configuration for AWS Serverless
  - [ ] 15.1 Configure Serverless Framework for backend
    - Complete serverless.yml with all functions
    - Configure Lambda timeout (300s for image generation)
    - Set up environment variables in serverless.yml
    - Configure API Gateway CORS settings
    - Add serverless-offline plugin for local development
    - _Requirements: 7.2, 9.2_

  - [ ] 15.2 Configure Amplify for frontend
    - Create amplify.yml build configuration
    - Configure Vite for optimized production builds
    - Set up environment variable for API Gateway URL
    - Configure SPA fallback routing (redirect all routes to index.html)
    - _Requirements: 9.2_

  - [ ] 15.3 Set up environment variables
    - Create .env.example files for both frontend and backend
    - Document REPLICATE_API_TOKEN configuration
    - Document VITE_API_GATEWAY_URL configuration
    - Add instructions for AWS Systems Manager Parameter Store (optional)
    - _Requirements: 7.2_

  - [ ] 15.4 Create deployment scripts
    - Add npm scripts for backend deployment (serverless deploy)
    - Add npm scripts for local development (serverless offline)
    - Document Amplify Console setup process
    - Create deployment checklist
    - _Requirements: 9.2_

  - [ ] 15.5 Add comprehensive README documentation
    - Document local development setup (serverless offline + vite dev)
    - Document Lambda function structure and API endpoints
    - Document Serverless Framework deployment process
    - Document Amplify Console deployment process
    - Include environment variable configuration guide
    - Add troubleshooting section (common Lambda/API Gateway issues)
    - Include cost estimation and AWS free tier information
    - _Requirements: 9.2_
