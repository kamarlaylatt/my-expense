# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js/Express REST API for personal expense tracking with multi-currency support. The application uses PostgreSQL (via Supabase), Prisma ORM, and JWT authentication.

## Development Commands

```bash
# Start development server with auto-reload (uses tsx for execution)
npm run dev

# Generate Prisma client (runs automatically after npm install)
npm run build
```

The application runs on port 3000 by default (configurable via `PORT` environment variable).

## Architecture

### Entry Point
`index.js` - Main Express application setup with CORS, JSON middleware, and route mounting.

### Layered Architecture
- **Routes** (`routes/`): Define API endpoints and attach validation middleware
- **Controllers** (`controllers/`): Handle business logic and database operations
- **Middleware** (`middleware/`): Authentication, request validation
- **Utils** (`utils/`): Prisma client singleton, Zod validation schemas

### Database
- **ORM**: Prisma with PostgreSQL adapter (`@prisma/adapter-pg`)
- **Connection pooling**: Uses Supabase pooler (port 6543) for runtime connections
- **Schema location**: `prisma/schema.prisma`
- **Prisma client**: `utils/prismaClient.js` exports a singleton instance with connection pooling

### Data Models
- **User**: Authentication (email/password or Google OAuth), supports linking OAuth to existing accounts
- **Category**: Expense categorization with colors (cascade delete with expenses)
- **Currency**: Multi-currency with USD exchange rates (cascade delete with expenses)
- **Expense**: Core tracking with date, amount, category, currency, and **historical USD exchange rate** (restrict delete if currency in use)

### Authentication
- JWT tokens with 7-day expiration (`JWT_EXPIRES_IN`)
- Password hashing with bcrypt (10 rounds)
- Google OAuth support: Frontend handles OAuth flow, backend receives user data via `POST /api/auth/google`
- Protected endpoints use `authenticate` middleware from `middleware/authMiddleware.js`
- Token format: `Authorization: Bearer <token>`

### Validation
- Zod schemas in `utils/validators.js`
- `validate(schema)` middleware factory validates `req.body`
- Returns 400 with field-specific errors on validation failure

### Response Format
All responses follow consistent structure:
- Success: `{ success: true, message: "...", data: {...} }`
- Error: `{ success: false, message: "...", errors: [...] }`

### Route Organization
- `/api/auth` - Public signup/signin, protected profile
- `/api/categories` - All protected
- `/api/currencies` - All protected
- `/api/expenses` - All protected

### Important Patterns

**Resource ownership verification**: All controllers check that resources belong to the authenticated user before operations.

**Date handling**: Date queries include the entire day (end date set to 23:59:59).

**Expense filtering**: Supports `categoryId`, `startDate`, `endDate`, `page`, `limit` query params.

**Historical exchange rates**: Each expense stores its own `usdExchangeRate` at creation time. This preserves historical accuracy when currency rates change. When creating an expense, the rate defaults to the currency's current rate but can be overridden. When updating an expense and changing `currencyId`, the rate defaults to the new currency's current rate unless explicitly provided.

**Cascading deletes**: Deleting a category or currency deletes all associated expenses. Currency deletion is restricted if expenses exist.

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection string (Supabase pooler: port 6543)
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `PORT` - Server port (default: 3000)

## Documentation

- `/docs/API.md` - Comprehensive API documentation with all endpoints
- `/postman/` - Postman collection for API testing
- `/GOOGLE_OAUTH_SETUP.md` - Google OAuth implementation guide
