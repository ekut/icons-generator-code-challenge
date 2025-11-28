# Project Structure

## Root Organization

```
icon-set-generator/
├── frontend/          # React frontend application
├── backend/           # Serverless backend API
└── README.md         # Project documentation
```

## Frontend Structure

```
frontend/
├── src/
│   ├── assets/       # Static assets (images, icons)
│   ├── App.tsx       # Main application component
│   ├── App.css       # Application styles
│   ├── main.tsx      # Application entry point
│   └── index.css     # Global styles
├── test/
│   └── setup.ts      # Test configuration
├── public/           # Public static files
├── dist/             # Build output (generated)
├── vite.config.ts    # Vite configuration
├── tsconfig.json     # TypeScript configuration
├── tailwind.config.js # Tailwind CSS configuration
├── amplify.yml       # AWS Amplify build configuration
└── package.json      # Dependencies and scripts
```

## Backend Structure

```
backend/
├── src/
│   ├── handlers/     # Lambda function handlers (generate.ts, getStyles.ts)
│   ├── services/     # Business logic and external API integrations
│   └── types/        # TypeScript type definitions
│       └── index.ts
├── dist/             # Compiled JavaScript output (generated)
├── serverless.yml    # Serverless Framework configuration
├── tsconfig.json     # TypeScript configuration
└── package.json      # Dependencies and scripts
```

## Key Conventions

- **TypeScript**: All source code uses TypeScript with strict mode enabled
- **Module System**: Both backend and frontend use ES modules
  - Backend: Compile TypeScript to ES modules (`.mjs` files)
  - Frontend: Native ES modules support via Vite
  - Use `import/export` syntax, not `require/module.exports`
- **Code Organization**: Handlers contain Lambda entry points, services contain business logic
- **Testing**: Frontend uses Vitest with React Testing Library and property-based testing (fast-check)
- **Build Output**: Both frontend and backend compile to `dist/` directories (gitignored)
- **Environment Config**: Use `.env` files (not committed) based on `.env.example` templates

## Module System Details

### Backend (Lambda)
- AWS Lambda **recommends ES modules** for Node.js 20.x
- Benefits: top-level await, modern standard, better optimization
- Handler files should use `.mjs` extension or set `"type": "module"` in package.json
- Example: `export const handler = async (event) => { ... }`

### Frontend (Vite)
- Vite requires ES modules
- Use `import` for all dependencies
- Example: `import { useState } from 'react'`
