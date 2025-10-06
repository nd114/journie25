# Mars' Hill

## Overview

This is a comprehensive collaborative research paper platform built as a full-stack web application. The platform allows researchers to publish papers, browse academic content, engage in discussions through comments, and manage their research workspace. It features user authentication, paper management with draft/published states, peer review workflow, real-time collaboration, analytics, and premium subscription tiers.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates (October 2025)

**Phase 4-7 Implementation Completed:**
- Advanced search with full-text search and filtering
- Citation generator (APA, MLA, Chicago, BibTeX, EndNote)
- Paper versioning with comparison and restore capabilities
- Comprehensive peer review workflow system
- Real-time collaborative editing via WebSocket
- Analytics dashboard with metrics tracking
- Performance optimizations (compression, caching, indexing)
- Real-time notification system
- PWA capabilities for mobile with offline support
- Premium subscription tiers with Stripe integration
- Institutional account management
- Public REST API v1 with documentation

**Beta Launch Preparation (October 5, 2025):**
- **CRITICAL FIX**: Fixed publishing workflow - papers can now be published on creation
- **CRITICAL FIX**: Fixed pagination - all 74 papers now load correctly with infinite scroll
- **UX IMPROVEMENT**: Improved author/keyword inputs - now accept comma-separated values
- **RESPONSIVE DESIGN**: Enhanced mobile layout for PaperEditor header and footer buttons
- **VISUAL POLISH**: Updated footer with professional design and proper legal links
- **NAVIGATION CLEANUP**: Removed unimplemented pages (Learning Paths, Tools) from navigation
- **UX POLISH**: Added scroll-to-top on route changes for better navigation experience
- **FOOTER CONSISTENCY**: Added footer to all 7 pages (About, Contact, FAQ, How It Works, Trending, Communities, User Profile)
- Disabled failing background jobs temporarily (will re-enable with email service)
- Verified Terms of Service and Privacy Policy pages are ready for launch

**Stability & Performance Fixes (October 6, 2025):**
- **CRASH FIX**: Added route-level ErrorBoundary with pathname key for automatic error recovery on navigation
- **RATE LIMIT FIX**: Increased auth endpoint rate limit from 10 to 50 requests per 15 minutes to prevent login failures
- **404 FIX**: Fixed missing favicon and icon references with inline SVG data URIs
- **ERROR RECOVERY**: Implemented per-route error boundaries that automatically reset on page navigation
- **INTEGRATION VERIFIED**: Confirmed backend-frontend integration working correctly (papers API, analytics, trending topics)
- All navigation links tested and verified working without crashes

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- **React 18** with TypeScript for type-safe UI development
- **Vite** as the build tool and development server
- **React Router v7** for client-side routing and navigation
- **Tailwind CSS** with custom configuration for styling, including dark mode support
- **PWA** enabled with service worker for offline capabilities

**State Management**
- Context API for global state (AuthContext for authentication)
- Local component state with React hooks
- Custom hooks for reusable logic (useAuth, useTheme, useDatabase)

**Key UI Components**
- Responsive Navbar with mobile hamburger menu
- PaperCard optimized for mobile and desktop
- CommentThread for nested discussion functionality
- Rich text editor using Quill/React-Quill
- Markdown rendering with react-markdown, rehype-raw, and remark-gfm
- Real-time notification bell
- Advanced search filters
- Citation generator UI

**Routing Structure**
- Public routes: Landing page (/), Browse papers (/library), Paper detail (/paper/:id), Auth page (/auth)
- Protected routes: Workspace dashboard (/workspace), Paper editor (/workspace/editor/:id?)
- Route protection via ProtectedRoute wrapper component

### Backend Architecture

**Server Framework**
- **Express.js** (v5.1.0) running on port 3000
- **Compression** middleware for gzip response compression
- CORS enabled for cross-origin requests
- JWT-based authentication
- **WebSocket Server** for real-time collaboration and notifications

**API Design Pattern**
- RESTful endpoints prefixed with `/api`
- Public API v1 endpoints prefixed with `/api/v1`
- JWT token verification middleware for protected routes
- API key authentication for public API access
- Rate limiting (100 requests/hour per API key)
- Standardized error handling and response format

**Performance Optimizations**
- In-memory caching with TTL for frequently accessed data
- Gzip compression for all responses
- Comprehensive database indexing
- Lazy loading support

**Real-time Features**
- WebSocket server for collaborative editing
- Real-time notifications
- Active collaborator tracking
- Section locking to prevent conflicts

### Data Storage

**Database System**
- **PostgreSQL** via Neon serverless driver
- **Drizzle ORM** v0.44.5 for type-safe database queries
- Database schema defined in `/shared/schema.ts`
- Comprehensive indexing on frequently queried fields

**Core Tables**
- users, papers, comments, reviews, citations
- paper_versions, paper_insights, paper_views, paper_analytics
- peer_review_assignments, peer_review_submissions
- notifications, notification_preferences
- subscriptions, payment_history
- institutions, institution_members, institution_invites
- api_keys, api_usage
- section_locks, paper_drafts
- user_follows, user_bookmarks, user_analytics

**Data Relationships**
- Many-to-many relationships via JSONB arrays
- Self-referencing hierarchy for research fields
- One-to-many relationships with proper foreign keys

### Authentication & Authorization

**Authentication Mechanism**
- JWT (jsonwebtoken v9.0.2) for stateless authentication
- Bcrypt (v6.0.0) for password hashing
- Token stored in localStorage, sent via Authorization header
- API key authentication for public API

**Authorization Patterns**
- authenticateToken middleware for user endpoints
- authenticateApiKey middleware for public API
- requirePremium middleware for subscription-gated features
- Role-based access control for institutional accounts

## Advanced Features

### Search & Discovery
- **Advanced Search**: Full-text search across title, abstract, content, authors
- **Filtering**: By date range, author, research field, keywords
- **Sorting**: By relevance, date, views, citations
- **Pagination**: Efficient result pagination

### Citation Management
- **Citation Generation**: APA, MLA, Chicago, BibTeX, EndNote formats
- **Citation Tracking**: Track citations between papers
- **Export**: Download citations in various formats

### Paper Versioning
- **Version Tracking**: Automatic versioning on major edits
- **Version Comparison**: Compare differences between versions
- **Version Restore**: Restore paper to any previous version

### Peer Review Workflow
- **Review Assignment**: Assign reviewers to papers
- **Blind Review**: Option to hide author information
- **Rating System**: 1-5 star ratings with recommendations
- **Review Status**: Tracking (pending, in_review, reviewed, accepted, rejected)

### Collaborative Editing
- **Real-time Sync**: WebSocket-based content synchronization
- **Active Collaborators**: See who's editing
- **Section Locking**: Prevent simultaneous edits
- **Auto-save Drafts**: Periodic draft saving

### Analytics
- **Paper Analytics**: Views, citations, downloads, engagement metrics
- **User Analytics**: Publication metrics, h-index, impact score
- **Trending Analysis**: Trending papers, topics, and authors
- **Timeline Analytics**: Historical performance tracking

### Notifications
- **Real-time Notifications**: WebSocket-based instant delivery
- **Email Notifications**: Configurable email alerts
- **Notification Types**: Comments, follows, citations, reviews, publications
- **Preferences**: User-customizable notification settings

### Premium Features (Stripe Integration)
- **FREE**: 5 papers max, basic analytics
- **PRO ($9.99/month)**: Unlimited papers, advanced analytics, API access
- **INSTITUTIONAL ($49.99/month)**: Team features, custom branding, dedicated support
- **Billing Portal**: Self-service subscription management

### Institutional Accounts
- **Institution Management**: Create and manage universities/labs
- **Team Collaboration**: Multi-user institutional accounts
- **Role-based Access**: Admin and member roles
- **Aggregate Analytics**: Institution-wide metrics
- **Member Invitations**: Email-based invitation system

### Public REST API
- **API Key System**: Secure API key generation and management
- **Rate Limiting**: 100 requests/hour per key
- **Usage Tracking**: Detailed usage statistics
- **Documentation**: OpenAPI 3.0 specification at /api/docs
- **Endpoints**: Papers, users, search with pagination

### PWA Capabilities
- **Installable**: Can be installed on mobile devices
- **Offline Support**: Service worker caching
- **Background Sync**: Draft synchronization
- **Responsive Design**: Optimized for 320px-1920px screens

## External Dependencies

### Third-Party Services
- **Neon** serverless PostgreSQL (@neondatabase/serverless v1.0.1)
- **Stripe** payment processing (stripe v19.0.0)

### Development Tools
- Drizzle Kit v0.31.5 for database management
- tsx v4.20.6 for TypeScript backend
- Command: `npm run db:push` to sync schema to database

### UI Libraries
- Lucide React v0.263.1 for icons
- Quill v2.0.3 and react-quill v2.0.0 for WYSIWYG editing
- React Markdown with extensions

### WebSocket Support
- ws v8.18.3 for real-time features
- WebSocket server integrated with Express

## Build & Deployment

**Environment Requirements**
- Node.js v20+
- DATABASE_URL (required)
- JWT_SECRET (required for authentication)
- STRIPE_SECRET_KEY (required for payments)
- STRIPE_PRO_PRICE_ID (required for PRO tier)
- STRIPE_INSTITUTIONAL_PRICE_ID (required for INSTITUTIONAL tier)
- STRIPE_WEBHOOK_SECRET (required for webhooks)

**Build Process**
- Development: `npm run dev` (frontend), `npm run server` (backend)
- Production Build: `npm run build`
- Production Start: `npm start`
- Database Sync: `npm run db:push`

**Deployment Configuration**
- Target: VM (for WebSocket support and state management)
- Build: `npm run build` (creates production assets)
- Run: `npm start` (production server on port 3000)
