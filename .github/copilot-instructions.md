# Gym Exercise App - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a full-stack gym exercise management application with a React TypeScript frontend and NestJS backend. The app allows users to browse, filter, and view details of various gym exercises with real-time data from a PostgreSQL database.

## Architecture
- **Monorepo Structure**: Apps separated in `apps/frontend` and `apps/backend`
- **Frontend**: React + TypeScript + Vite (deployed on Vercel)
- **Backend**: NestJS + TypeORM + PostgreSQL (deployed on Vercel Serverless)
- **Database**: Supabase PostgreSQL with 54+ exercises
- **Deployment**: Full Vercel stack with environment-based configuration

## Code Style & Conventions
- Use TypeScript for all components and utilities
- Use functional components with React hooks
- Implement responsive design with Tailwind CSS
- Use proper TypeScript interfaces for data models
- Follow component-based architecture
- Use descriptive component and variable names in Spanish when appropriate
- Follow NestJS conventions for backend (modules, controllers, services)
- Use TypeORM decorators for database entities
- Implement proper error handling and logging

## Security & Environment Best Practices
**🚨 CRITICAL: NO hardcoded data or sensitive variables**

### Environment Variables (REQUIRED)
- **Frontend**: Use `VITE_API_BASE_URL` for API endpoints
- **Backend**: Use environment variables for database connection
- **Never commit**: API keys, database URLs, passwords, or tokens
- **Always use**: `.env.local`, `.env.example`, and Vercel environment settings

### Configuration Patterns
```typescript
// ✅ GOOD: Environment-based configuration
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// ✅ GOOD: Database configuration
TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  // ...
});

// ❌ BAD: Hardcoded URLs or credentials
const apiUrl = 'https://my-api.vercel.app/api';
const dbUrl = 'postgresql://user:pass@host:port/db';
```

## Technology Stack

### Frontend (`apps/frontend`)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **Testing**: Jest + Testing Library
- **Deployment**: Vercel
- **Environment**: Vite environment variables (`VITE_*`)

### Backend (`apps/backend`)
- **Framework**: NestJS 11
- **Database ORM**: TypeORM
- **Database**: PostgreSQL (Supabase)
- **Testing**: Jest + Supertest
- **Deployment**: Vercel Serverless
- **Authentication**: Environment-based configuration
- **Design/Architecture**: DDD, TDD 

### Development Tools
- **Monorepo**: npm workspaces
- **Linting**: ESLint with TypeScript rules
- **CI/CD**: GitHub Actions with automated testing
- **Package Management**: npm
- **Version Control**: Git with conventional commits

## Key Features
- Exercise catalog with filtering by category (fuerza, cardio, flexibilidad, etc.)
- Exercise details view with instructions and muscle groups
- Real-time data from PostgreSQL database
- Responsive design for mobile and desktop
- Modern, clean UI with Netflix-inspired design
- Full CRUD operations via REST API
- Automated testing and deployment pipelines

## Development Workflow
1. **Local Development**: Use environment variables for API connections
2. **Testing**: Run both frontend and backend test suites
3. **Building**: Ensure TypeScript compilation succeeds
4. **Deployment**: Automatic via Vercel on push to main
5. **Environment Management**: Use Vercel dashboard or CLI for production variables

## API Integration
- **Base URL**: Configurable via `VITE_API_BASE_URL`
- **Endpoints**: RESTful API (`/api/exercises`, `/api/exercises/categories`)
- **Error Handling**: Proper HTTP status codes and error messages
- **CORS**: Configured for Vercel deployments

## Database Schema
- **Exercises Table**: ID, name, description, category, difficulty, muscle groups, equipment, instructions
- **Categories**: Dynamic from database (cardio, functional, strength)
- **TypeORM Entities**: Properly decorated with database constraints

## File Structure Patterns
```
apps/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API integration
│   │   ├── types/          # TypeScript interfaces
│   │   └── test/          # Jest tests
│   ├── vercel.json        # Vercel configuration
│   └── .env.example       # Environment template
└── backend/
    ├── src/
    │   ├── exercises/      # Feature module
    │   │   ├── entities/   # TypeORM entities
    │   │   ├── dto/        # Data transfer objects
    │   │   └── *.spec.ts   # Unit tests
    │   └── database/       # Database utilities
    ├── vercel.json         # Serverless config
    └── .env.example        # Environment template
```

## Important Commands
```bash
# Development
npm run dev                    # Start both frontend and backend
npm run frontend:dev           # Frontend only
npm run backend:dev            # Backend only

# Testing
npm run test                   # Run all tests
npm run frontend:test          # Frontend tests
npm run backend:test           # Backend tests

# Deployment
npm run deploy:frontend        # Deploy frontend to Vercel
npm run deploy:backend         # Deploy backend to Vercel
npm run setup-env:frontend     # Configure frontend environment
npm run setup-env:backend      # Configure backend environment
```


evitar crear .md innecesarios
