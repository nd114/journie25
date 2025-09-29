# Research Platform

## Overview

This is a collaborative research paper platform built as a full-stack web application. The platform allows researchers to publish papers, browse academic content, engage in discussions through comments, and manage their research workspace. It features user authentication, paper management with draft/published states, and a community-driven review system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- **React 18** with TypeScript for type-safe UI development
- **Vite** as the build tool and development server, configured to run on port 5000
- **React Router v7** for client-side routing and navigation
- **Tailwind CSS** with custom configuration for styling, including dark mode support ('class' strategy)

**State Management**
- Context API for global state (AuthContext for authentication)
- Local component state with React hooks (useState, useEffect)
- Custom hooks for reusable logic (useAuth, useTheme, useDatabase)

**Key UI Components**
- Navbar with authentication state awareness
- PaperCard for displaying paper previews
- CommentThread for nested discussion functionality
- Rich text editor using Quill/React-Quill for paper content editing
- Markdown rendering with react-markdown, rehype-raw, and remark-gfm for GitHub-flavored markdown

**Routing Structure**
- Public routes: Landing page (/), Browse papers (/library), Paper detail (/paper/:id), Auth page (/auth)
- Protected routes: Workspace dashboard (/workspace), Paper editor (/workspace/editor/:id?)
- Route protection implemented via ProtectedRoute wrapper component checking user authentication state

### Backend Architecture

**Server Framework**
- **Express.js** (v5.1.0) running on port 3000
- CORS enabled for cross-origin requests
- JSON body parsing middleware
- JWT-based authentication with bearer token verification middleware

**API Design Pattern**
- RESTful endpoints prefixed with `/api`
- Vite dev server proxies `/api` requests to backend (localhost:3000)
- JWT token verification middleware for protected routes
- Standardized error handling and response format

**Authentication Flow**
- POST /api/auth/register - User registration with bcrypt password hashing (salt rounds: 10)
- POST /api/auth/login - User login returning JWT token
- JWT_SECRET environment variable required for token signing/verification
- Token stored in localStorage on client, sent via Authorization header

**Data Access Layer**
- Storage abstraction pattern via IStorage interface
- DatabaseStorage class implementing all data operations
- Methods organized by domain: Users, Papers, Comments, Reviews
- Drizzle ORM for type-safe database queries

### Data Storage

**Database System**
- **PostgreSQL** as primary database (configured via DATABASE_URL environment variable)
- **Drizzle ORM** v0.44.5 with Neon serverless driver for database operations
- Database schema defined in `/shared/schema.ts` for code sharing between frontend/backend
- Migration files output to `/drizzle` directory

**Schema Design**
- **Users table**: Authentication (email/password), profile data (name, ORCID, affiliation, bio), timestamps
- **Papers table**: Core content (title, abstract, content, PDF URL), metadata (authorIds, fieldIds as JSONB arrays), versioning, publication status, DOI
- **Journals table**: Publication venues with slug-based URLs
- **Fields table**: Research categories with self-referencing parent-child hierarchy
- **Comments table**: Discussion threads with parent-child relationships
- **Reviews table**: Peer review functionality
- **Citations table**: Paper citation tracking

**Data Relationships**
- Many-to-many relationships via JSONB arrays (papers-authors, papers-fields)
- Self-referencing hierarchy for research fields (parentId)
- One-to-many relationships (papers-comments, papers-reviews)

### Authentication & Authorization

**Authentication Mechanism**
- JWT (jsonwebtoken v9.0.2) for stateless authentication
- Bcrypt (v6.0.0) for password hashing
- Token-based session management (no server-side sessions)
- Client stores token in localStorage, includes in Authorization header

**Authorization Pattern**
- authenticateToken middleware extracts and verifies JWT from Authorization header
- Decoded user info attached to request object for downstream handlers
- 401 status for missing tokens, 403 for invalid tokens
- Frontend ProtectedRoute component prevents unauthorized access to protected pages

**User Management**
- User lookup by ID and email
- User creation with hashed passwords
- User profile updates (partial updates supported)
- No password reset/forgot password mechanism currently implemented

## External Dependencies

### Third-Party Services

**Database Provider**
- **Neon** serverless PostgreSQL (@neondatabase/serverless v1.0.1)
- Connection via DATABASE_URL environment variable
- HTTP-based SQL client for serverless environments

**Potential Future Integrations**
- **Supabase** client library included (@supabase/supabase-js v2.52.1) but not actively used
- Could provide authentication, storage, or realtime features

### Development Tools

**Database Management**
- Drizzle Kit v0.31.5 for schema migrations and database pushes
- Command: `npm run db:push` to sync schema to database
- Alternative SQLite support via better-sqlite3 (types included but not primary database)

**Development Server**
- tsx v4.20.6 for running TypeScript backend with watch mode
- Command: `npm run server` for backend development
- Vite dev server with HMR for frontend development

### UI Libraries

**Icons & Rich Media**
- Lucide React v0.263.1 for consistent icon set
- Quill v2.0.3 and react-quill v2.0.0 for WYSIWYG editing
- React Markdown with extensions for content rendering

**WebSocket Support**
- ws v8.18.3 for real-time communication capabilities (types included, implementation status unclear)

### Build & Deployment

**Environment Requirements**
- Node.js v20+ (per @types/node)
- DATABASE_URL environment variable (required, throws error if missing)
- JWT_SECRET environment variable (required for authentication)

**Build Process**
- TypeScript compilation followed by Vite build
- Separate tsconfig files for app (tsconfig.json) and tooling (tsconfig.node.json)
- Output optimized for modern browsers (ES2020 target)