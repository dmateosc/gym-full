# Gym Exercise App - Copilot Instructions

## Project Overview
This is a full-stack gym exercise management application with a React TypeScript frontend and NestJS backend. The app allows users to browse, filter, and view details of various gym exercises with real-time data from a PostgreSQL database.

## Architecture
- **Monorepo Structure**: Apps separated in `apps/frontend` and `apps/backend`
- **Frontend**: React + TypeScript + Vite (served by nginx in Docker)
- **Backend**: NestJS + TypeORM + PostgreSQL (Node container)
- **Database**: PostgreSQL self-hosted on the homelab
- **Deployment**: Self-hosted on the homelab (Docker Compose + Traefik) — `gym.3dmc.lab` (prod) / `gym-dev.3dmc.lab` (dev). Auto-deploys via the `Deploy — gym.3dmc.lab` GitHub Actions workflow on push to `main`, running on a self-hosted runner in CT 100.

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
- **Always use**: `.env.local`, `.env.example`, and the homelab stack's `/opt/stacks/gym-full/.env`

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
const apiUrl = 'https://my-api.example.com/api';
const dbUrl = 'postgresql://user:pass@host:port/db';
```

## Technology Stack

### Frontend (`apps/frontend`)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **Testing**: Jest + Testing Library
- **Deployment**: Docker image (nginx) on the homelab, port 8090
- **Environment**: Vite environment variables (`VITE_*`)

### Backend (`apps/backend`)
- **Framework**: NestJS 11
- **Database ORM**: TypeORM
- **Database**: PostgreSQL (homelab)
- **Testing**: Jest + Supertest
- **Deployment**: Docker (Node) on the homelab, port 3001
- **Authentication**: Environment-based configuration
- **Design/Architecture**: DDD, TDD

### Development Tools
- **Monorepo**: npm workspaces
- **Linting**: ESLint with TypeScript rules
- **CI/CD**: GitHub Actions with automated testing + self-hosted deploy runner
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
4. **Deployment**: Automatic via the homelab deploy workflow on push to `main` (selective rebuild based on `apps/frontend/**` or `apps/backend/**` changes)
5. **Environment Management**: Edit `/opt/stacks/gym-full/.env` on the homelab and `docker compose up -d --force-recreate <service>` to apply

## API Integration
- **Base URL**: Configurable via `VITE_API_BASE_URL`
- **Endpoints**: RESTful API (`/api/exercises`, `/api/exercises/categories`)
- **Error Handling**: Proper HTTP status codes and error messages
- **CORS**: Configured via the `CORS_ORIGINS` env var on the backend container

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
│   │   └── test/           # Jest tests
│   └── .env.example        # Environment template
└── backend/
    ├── src/
    │   ├── exercises/      # Feature module
    │   │   ├── entities/   # TypeORM entities
    │   │   ├── dto/        # Data transfer objects
    │   │   └── *.spec.ts   # Unit tests
    │   └── database/       # Database utilities
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
```

evitar crear documentación cada vez que se hace algo a menos que lo especifique
evitar crear .md innecesarios
