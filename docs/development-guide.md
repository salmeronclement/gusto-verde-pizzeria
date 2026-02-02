# Development Guide

## Prerequisites
- **Node.js**: v18+ Recommended
- **MySQL**: v8.0+
- **npm** or **yarn**

## Installation & Setup

### 1. Backend
The backend handles the API and database connection.

```bash
cd backend
npm install
```

**Configuration**:
Create a `.env` file in `backend/` based on `.env.example`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=pizzeria_db
JWT_SECRET=your_secure_secret
TWILIO_SID=...
TWILIO_TOKEN=...
```

**Database Init**:
Run the initialization scripts to create tables:
```bash
npm run init-db
```

**Start Server**:
```bash
npm start
# Server runs on http://localhost:5000
```

### 2. Frontend
The frontend is the React application.

```bash
cd frontend
npm install
```

**Configuration**:
Ensure `src/services/api.ts` points to your backend URL (Proxy or absolute).

**Start Dev Server**:
```bash
npm run dev
# App runs on http://localhost:5175
```

## Build for Production
To build the frontend for deployment:

```bash
cd frontend
npm run build
# Output in frontend/dist
```
