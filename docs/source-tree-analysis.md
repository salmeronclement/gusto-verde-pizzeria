# Source Tree Analysis

## Directory Structure

### Root
`c:\Users\Clement\Desktop\Projet_web\New_concept_pizzeria`
- **docs/**: Project documentation (this folder).
- **.agent/**: AI Agent workflows and configs.

### Backend (`/backend`)
Node.js/Express API Server.

```
backend/
├── config/             # Database connectivity (db.js)
├── middleware/         # Auth (adminMiddleware.js, authMiddleware.js)
├── routes/             # API Endpoints (orders, auth, products, admin*)
├── services/           # Business logic (smsService.js)
├── sql/                # SQL Schemas and migrations
├── scripts/            # DB Initialization and maintenance scripts
├── uploads/            # Static image storage
├── server.js           # Entry Point (Express App)
└── .env                # Environment variables (Secrets)
```

**Key Files:**
- `server.js`: Main application entry, middleware setup, route mounting.
- `routes/api.js` (Various): Defines the contracts for frontend interaction.
- `config/db.js`: MySQL connection pool configuration.

### Frontend (`/frontend`)
React (Vite) SPA.

```
frontend/
├── public/             # Static assets (favicons, manifests)
├── src/
│   ├── assets/         # Images, fonts
│   ├── components/     # UI Components (Forms, Layout, Products)
│   ├── pages/          # Route Views (Home, Menu, Admin, Driver)
│   ├── services/       # API Client (api.ts - Axios instance)
│   ├── store/          # Zustand State Stores (useCartStore, useAuthStore)
│   ├── App.tsx         # Main Component / Routing
│   └── main.tsx        # Entry Point (DOM Mount)
├── vite.config.ts      # Build configuration
└── tailwind.config.js  # Design system configuration
```

**Key Files:**
- `src/services/api.ts`: Centralized API client. All backend communication goes through here.
- `src/store/useCartStore.ts`: Critical state logic for the shopping cart.
- `src/App.tsx`: Router configuration.

## Critical Integration Points
- **API Communication**: Frontend `src/services/api.ts` -> Backend `routes/*.js`
- **Authentication**:
  - JWT tokens stored in LocalStorage.
  - Admin/Driver tokens handled via interceptors in `api.ts`.
- **Static Assets**:
  - Images uploaded to `backend/uploads` are served via `express.static` and consumed by frontend helper `getImageUrl`.
