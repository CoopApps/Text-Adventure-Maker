# Gamebook Creator - Backend Architecture Plan

## Executive Summary

The Interactive Gamebook Creator currently operates as a client-side only application. This document outlines a comprehensive backend architecture to transform it into a full-featured platform with data persistence, multi-user support, export generation, and publishing capabilities.

---

## 🎯 Current State Analysis

### Existing Features
- Visual node-based editor for gamebooks
- Story nodes with action types (Start, Choice, Conditional, Combat, Web Mark, Inventory, Success, Game Over)
- Connection system (Normal, Conditional, Backward, Combat)
- Progress systems (Web Tracking, Skills, Inventory, Relationships)
- Client-side export intentions (iOS, Android, Web, PDF, JSON, Inform7)
- Auto-layout and validation tools

### Current Limitations
- ❌ No data persistence (projects lost on refresh)
- ❌ No user accounts or authentication
- ❌ Export formats not actually implemented
- ❌ No collaboration features
- ❌ No cloud storage or project sharing
- ❌ No analytics or playthrough tracking
- ❌ No asset management (images, audio, fonts)

---

## 🏗️ Recommended Backend Architecture

### Option 1: **Node.js + Express + PostgreSQL** (Recommended)

**Why This Stack?**
- ✅ JavaScript continuity (same language as frontend)
- ✅ Excellent JSON handling (your project data is JSON-based)
- ✅ Rich ecosystem for game development
- ✅ Great export generation libraries
- ✅ Easy WebSocket support for real-time collaboration
- ✅ Strong community and tooling

**Tech Stack:**
```
Backend:     Node.js 20+ with Express.js or Fastify
Database:    PostgreSQL 15+ (relational data) + Redis (caching)
ORM:         Prisma or TypeORM
Storage:     AWS S3 / Cloudflare R2 / MinIO (for assets)
Auth:        Passport.js or Auth.js (NextAuth)
Real-time:   Socket.io or WebSockets
API:         REST + GraphQL (optional)
Queue:       Bull or BullMQ (for export jobs)
Deploy:      Docker + AWS/Render/Railway
```

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (HTML/JS)                    │
│              Interactive Visual Editor                   │
└───────────────────┬─────────────────────────────────────┘
                    │ REST API / GraphQL
                    ▼
┌─────────────────────────────────────────────────────────┐
│              API Gateway (Express/Fastify)               │
│  ┌──────────┬──────────┬──────────┬─────────────────┐  │
│  │ Projects │  Users   │  Export  │  Collaboration  │  │
│  │ Service  │ Service  │  Service │     Service     │  │
│  └──────────┴──────────┴──────────┴─────────────────┘  │
└───────────────┬─────────────────────┬───────────────────┘
                │                     │
        ┌───────▼────────┐    ┌──────▼──────┐
        │   PostgreSQL   │    │    Redis    │
        │  (Projects,    │    │  (Sessions, │
        │   Users, etc)  │    │   Cache)    │
        └────────────────┘    └─────────────┘
                │
        ┌───────▼────────┐
        │  S3/R2 Storage │
        │  (Images, etc) │
        └────────────────┘
```

---

### Option 2: **Python/FastAPI + PostgreSQL** (Alternative)

**Why This Stack?**
- ✅ Excellent for PDF/export generation (ReportLab, PyPDF2, Jinja2)
- ✅ Great for game logic processing
- ✅ Strong ML/AI integration (future smart features)
- ✅ Robust data validation with Pydantic
- ✅ Fast API performance

**Tech Stack:**
```
Backend:     Python 3.11+ with FastAPI
Database:    PostgreSQL + Redis
ORM:         SQLAlchemy or Tortoise ORM
Storage:     AWS S3 / Cloudflare R2
Auth:        FastAPI-Users or Authlib
Real-time:   FastAPI WebSockets
API:         REST + optional GraphQL (Strawberry)
Queue:       Celery + Redis
Deploy:      Docker + AWS/DigitalOcean
```

---

### Option 3: **Firebase/Supabase** (Fastest to Market)

**Why This Stack?**
- ✅ Fastest development time
- ✅ Built-in auth, database, storage, real-time
- ✅ Generous free tier
- ✅ Auto-scaling
- ✅ Good for MVPs and rapid prototyping

**Limitations:**
- ⚠️ Vendor lock-in
- ⚠️ Less control over infrastructure
- ⚠️ Export generation requires separate services
- ⚠️ Cost can scale quickly

---

## 📊 Database Schema Design

### Core Tables (PostgreSQL)

```sql
-- Users & Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free, pro, enterprise
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects/Gamebooks
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  visibility VARCHAR(20) DEFAULT 'private', -- private, unlisted, public
  node_data JSONB NOT NULL, -- All nodes and their properties
  connection_data JSONB NOT NULL, -- All connections
  progress_systems JSONB, -- Web, Skills, Inventory, Relationships
  settings JSONB, -- Game settings, themes, etc
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_opened_at TIMESTAMP,
  published_at TIMESTAMP,
  fork_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_visibility ON projects(visibility);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Project Versions (for history/undo)
CREATE TABLE project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  node_data JSONB NOT NULL,
  connection_data JSONB NOT NULL,
  commit_message TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Collaborators (for team projects)
CREATE TABLE project_collaborators (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- owner, editor, viewer
  invited_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

-- Assets (images, audio, fonts)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- image/png, audio/mp3, etc
  file_size BIGINT NOT NULL,
  storage_key TEXT NOT NULL, -- S3/R2 key
  url TEXT NOT NULL,
  metadata JSONB, -- dimensions, duration, etc
  created_at TIMESTAMP DEFAULT NOW()
);

-- Published Gamebooks
CREATE TABLE published_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  game_data JSONB NOT NULL, -- Complete game snapshot
  version VARCHAR(20) NOT NULL,
  published_by UUID REFERENCES users(id),
  published_at TIMESTAMP DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

-- Playthroughs & Analytics
CREATE TABLE playthroughs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES published_games(id),
  player_id UUID REFERENCES users(id), -- NULL for anonymous
  session_id UUID NOT NULL,
  current_node_id VARCHAR(50),
  game_state JSONB, -- Inventory, flags, stats, etc
  path_taken JSONB[], -- Array of choices made
  started_at TIMESTAMP DEFAULT NOW(),
  last_action_at TIMESTAMP DEFAULT NOW(),
  completed BOOLEAN DEFAULT false,
  completion_type VARCHAR(50) -- success, game-over, abandoned
);

-- Export Jobs (for background processing)
CREATE TABLE export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES users(id),
  export_format VARCHAR(50) NOT NULL, -- ios, android, web, pdf, json, inform7
  status VARCHAR(20) DEFAULT 'queued', -- queued, processing, completed, failed
  options JSONB,
  output_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Templates & Marketplace
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- fantasy, sci-fi, mystery, etc
  template_data JSONB NOT NULL,
  price DECIMAL(10,2) DEFAULT 0, -- 0 for free templates
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comments & Feedback
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES published_games(id),
  user_id UUID REFERENCES users(id),
  parent_id UUID REFERENCES comments(id), -- for replies
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Likes/Favorites
CREATE TABLE likes (
  user_id UUID REFERENCES users(id),
  game_id UUID REFERENCES published_games(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, game_id)
);
```

---

## 🔌 API Design

### RESTful Endpoints

```
Authentication
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login with credentials
POST   /api/auth/logout            - Logout current user
POST   /api/auth/refresh           - Refresh access token
GET    /api/auth/me                - Get current user profile

Projects
GET    /api/projects               - List user's projects
POST   /api/projects               - Create new project
GET    /api/projects/:id           - Get project details
PUT    /api/projects/:id           - Update project
DELETE /api/projects/:id           - Delete project
POST   /api/projects/:id/fork      - Fork a project
POST   /api/projects/:id/duplicate - Duplicate own project

Project Versions
GET    /api/projects/:id/versions  - List project versions
POST   /api/projects/:id/versions  - Create new version
GET    /api/projects/:id/versions/:version - Get specific version
POST   /api/projects/:id/restore/:version  - Restore to version

Collaboration
GET    /api/projects/:id/collaborators     - List collaborators
POST   /api/projects/:id/collaborators     - Invite collaborator
DELETE /api/projects/:id/collaborators/:userId - Remove collaborator
PATCH  /api/projects/:id/collaborators/:userId - Update role

Assets
GET    /api/projects/:id/assets    - List project assets
POST   /api/projects/:id/assets    - Upload asset
DELETE /api/assets/:id             - Delete asset
GET    /api/assets/:id/download    - Download asset

Export
POST   /api/projects/:id/export    - Create export job
GET    /api/export-jobs/:id        - Check export status
GET    /api/export-jobs/:id/download - Download export

Publishing
POST   /api/projects/:id/publish   - Publish gamebook
PUT    /api/games/:slug            - Update published game
DELETE /api/games/:slug            - Unpublish game
GET    /api/games/:slug            - Get published game data
POST   /api/games/:slug/play       - Start playthrough

Community
GET    /api/games                  - Browse published games
GET    /api/games/:slug/comments   - Get game comments
POST   /api/games/:slug/comments   - Add comment
POST   /api/games/:slug/like       - Like/unlike game
GET    /api/templates              - Browse templates
POST   /api/templates/:id/use      - Use template for new project

Analytics
GET    /api/projects/:id/stats     - Project analytics
GET    /api/games/:slug/analytics  - Published game analytics
```

---

## 🎨 Export Generation System

### Priority Exports to Implement

#### 1. **JSON Export** (Easiest, Essential)
```javascript
// Complete game data export
{
  "metadata": {
    "title": "My Adventure",
    "version": "1.0",
    "created": "2025-12-23",
    "nodeCount": 50,
    "entryPoint": "node-1"
  },
  "nodes": [...],
  "connections": [...],
  "systems": {...}
}
```

#### 2. **Web App Export** (High Priority)
```
Generate standalone HTML5 game:
- Self-contained single HTML file
- or Modern SPA with React/Vue
- Progressive Web App (PWA) capabilities
- Offline playability
- Mobile responsive
- Save/load game states
```

**Implementation:**
```javascript
// Node.js backend
const generateWebExport = async (projectData) => {
  // Use template engine (EJS, Handlebars)
  const html = await renderTemplate('game-template.ejs', {
    gameData: projectData,
    title: projectData.title,
    nodes: projectData.nodes
  });

  // Minify and bundle
  const bundled = await bundleAssets(html, css, js);

  // Create ZIP with all assets
  const zip = await createZipArchive(bundled);

  return zip;
};
```

#### 3. **PDF Gamebook** (Traditional Format)
```
Using Node.js:
- PDFKit or Puppeteer
- Professional layout with page numbers
- Cross-references for entries
- Print-ready format
- Cover page generation
```

**Implementation:**
```javascript
const PDFDocument = require('pdfkit');
const generatePDF = async (projectData) => {
  const doc = new PDFDocument();

  // Cover page
  doc.fontSize(36).text(projectData.title, { align: 'center' });

  // Generate entries
  projectData.nodes.forEach((node, index) => {
    doc.addPage();
    doc.fontSize(24).text(`Entry ${node.entryNumber}`);
    doc.fontSize(12).text(node.content);

    // Add choices with references
    node.choices.forEach(choice => {
      doc.text(`→ ${choice.text} (turn to ${choice.target})`);
    });
  });

  return doc;
};
```

#### 4. **Inform 7 Export** (Interactive Fiction)
```
Convert to Inform 7 source code:
- Map nodes to Inform rooms/scenes
- Convert choices to Inform actions
- Translate conditions to Inform rules
- Generate .ni file
```

#### 5. **Mobile App Exports** (Advanced)
```
iOS: Generate React Native / Flutter project
Android: Generate React Native / Flutter project

Alternative: Use Capacitor to wrap web export
```

---

## 🚀 Implementation Roadmap

### Phase 1: MVP Backend (4-6 weeks)
```
Week 1-2: Core Infrastructure
✅ Set up Node.js + Express + PostgreSQL
✅ Implement user authentication (JWT)
✅ Database schema creation
✅ Basic CRUD for projects

Week 3-4: Project Management
✅ Save/load projects
✅ Project versioning
✅ Asset upload (images)
✅ Basic API documentation

Week 5-6: Export System
✅ JSON export (complete)
✅ Web app export (basic)
✅ Export job queue
✅ File storage (S3/R2)
```

### Phase 2: Enhanced Features (4-6 weeks)
```
✅ Collaboration system
✅ Real-time editing (WebSockets)
✅ PDF export
✅ Template marketplace
✅ Project forking
```

### Phase 3: Community & Publishing (4-6 weeks)
```
✅ Game publishing
✅ Player analytics
✅ Comments & ratings
✅ Browse published games
✅ Search and discovery
```

### Phase 4: Advanced Exports (4-6 weeks)
```
✅ Inform 7 export
✅ Mobile app generation
✅ Custom themes
✅ Advanced game mechanics
```

---

## 💰 Cost Estimation

### Development Costs
```
Backend Development:        8-12 weeks @ $75-150/hr = $24,000-72,000
Or DIY with this plan:      8-12 weeks your time = $0
```

### Infrastructure Costs (Monthly)

**Starter Tier (0-1000 users):**
```
Database (PostgreSQL):      $20/month (DigitalOcean/Render)
Storage (S3/R2):           $5-10/month (50GB)
Server (Docker):           $10-20/month (2GB RAM)
Redis:                     $10/month or included
Domain + SSL:              $2/month
TOTAL:                     $47-62/month
```

**Growth Tier (1000-10,000 users):**
```
Database:                  $60/month (larger instance)
Storage:                   $20-50/month (200GB)
Server:                    $40-80/month (4-8GB RAM)
CDN (Cloudflare):          $20/month
TOTAL:                     $140-210/month
```

**Free Tier Option (Supabase):**
```
Database, Auth, Storage:   $0/month (limited)
Upgrade when needed:       $25/month
```

---

## 🔐 Security Considerations

### Must-Have Security Features
```
✅ Password hashing (bcrypt/argon2)
✅ JWT token authentication
✅ Rate limiting (express-rate-limit)
✅ Input validation (Joi/Zod)
✅ SQL injection protection (parameterized queries)
✅ XSS protection
✅ CORS configuration
✅ File upload validation
✅ Environment variable management (.env)
✅ HTTPS enforcement
```

---

## 📦 Recommended Tech Stack (Final)

```yaml
Language: TypeScript (type safety for both frontend and backend)
Runtime: Node.js 20+
Framework: Express.js or Fastify
Database: PostgreSQL 15+
Cache: Redis 7+
ORM: Prisma (best TypeScript support)
Auth: Passport.js + JWT
Storage: Cloudflare R2 (cheaper than S3)
Queue: BullMQ
WebSockets: Socket.io
API Docs: Swagger/OpenAPI
Testing: Jest + Supertest
Deployment: Docker + Railway/Render
CI/CD: GitHub Actions
```

---

## 🎯 Next Steps

### Immediate Actions:
1. **Choose your stack** (I recommend Node.js + PostgreSQL)
2. **Set up development environment**
3. **Create database schema**
4. **Implement authentication first**
5. **Build project CRUD operations**
6. **Add JSON export (easiest win)**
7. **Deploy MVP and test**

### Questions to Answer:
- Will this be a commercial product or open source?
- Do you want real-time collaboration?
- What's your primary export format priority?
- Do you need mobile apps or web-only?
- What's your target launch timeline?

---

## 📚 Learning Resources

```
Node.js + Express:
- https://expressjs.com/
- https://nodejs.dev/

Prisma ORM:
- https://www.prisma.io/docs

PostgreSQL:
- https://www.postgresql.org/docs/

PDF Generation:
- https://pdfkit.org/
- https://github.com/puppeteer/puppeteer

Web Game Frameworks:
- https://phaser.io/ (if you want rich interactivity)
- https://twinery.org/ (for inspiration)
```

---

## 💡 Conclusion

**My Recommendation:** Start with **Node.js + Express + PostgreSQL** for maximum flexibility and control. This gives you:

✅ Full control over your stack
✅ Easy JavaScript transition from frontend
✅ Strong export generation capabilities
✅ Great community support
✅ Scalable architecture
✅ Moderate infrastructure costs

Begin with Phase 1 (MVP Backend) focusing on:
1. User authentication
2. Project save/load
3. JSON export
4. Web app export

This gives you a functional product in 4-6 weeks that can then be enhanced incrementally.

**Alternative for Fastest Launch:** Use **Supabase** if you want to ship in 2-3 weeks with minimal backend code, then migrate to custom backend later if needed.
