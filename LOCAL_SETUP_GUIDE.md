# QuestClash Local Setup Guide

Complete guide to run QuestClash on your local computer, including all dependencies, tech stack, and setup instructions.

---

## Table of Contents
1. [Tech Stack Overview](#tech-stack-overview)
2. [System Requirements](#system-requirements)
3. [Frontend Setup](#frontend-setup)
4. [Backend Setup (Optional)](#backend-setup-optional)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Tech Stack Overview

### Frontend Stack
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Vite 6.3.5** - Build tool and dev server
- **React Router DOM 7.6.0** - Client-side routing
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Shadcn/UI** - Component library built on Radix UI
- **Framer Motion 12.23.24** - Animation library
- **React Query (TanStack Query) 5.76.0** - Data fetching and caching
- **Lucide React 0.510.0** - Icon library
- **Zod 3.24.4** - Schema validation
- **React Hook Form 7.56.3** - Form management

### Backend Stack (Recommended)
- **Node.js 18+** - JavaScript runtime
- **Express.js** or **NestJS** - Web framework
- **PostgreSQL** or **MongoDB** - Database
- **Prisma** or **TypeORM** - ORM
- **JWT (jsonwebtoken)** - Authentication
- **Socket.io** - Real-time WebSocket connections
- **Multer** - File upload handling
- **AWS SDK** or **Cloudinary** - File storage

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

### Check Your Current Versions
```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be 9.0.0 or higher
```

---

## Frontend Setup

### Step 1: Install Node.js

#### Windows
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer (.msi file)
3. Follow the installation wizard
4. Restart your terminal/command prompt

#### macOS
```bash
# Using Homebrew (recommended)
brew install node

# Or download from nodejs.org
```

#### Linux (Ubuntu/Debian)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Clone or Download the Project

```bash
# If using Git
git clone <your-repository-url>
cd questclash

# Or download and extract the ZIP file
```

### Step 3: Install Frontend Dependencies

```bash
# Navigate to project directory
cd questclash

# Install all dependencies
npm install
```

This will install all the following packages:

#### Core Dependencies
```json
{
  "@tanstack/react-query": "^5.76.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.6.0",
  "framer-motion": "^12.23.24"
}
```

#### UI Component Libraries
```json
{
  "@radix-ui/react-accordion": "^1.2.10",
  "@radix-ui/react-alert-dialog": "^1.1.13",
  "@radix-ui/react-avatar": "^1.1.9",
  "@radix-ui/react-checkbox": "^1.3.1",
  "@radix-ui/react-dialog": "^1.1.13",
  "@radix-ui/react-dropdown-menu": "^2.1.14",
  "@radix-ui/react-label": "^2.1.6",
  "@radix-ui/react-popover": "^1.1.13",
  "@radix-ui/react-progress": "^1.1.6",
  "@radix-ui/react-select": "^2.2.4",
  "@radix-ui/react-separator": "^1.1.6",
  "@radix-ui/react-slider": "^1.3.4",
  "@radix-ui/react-slot": "^1.2.2",
  "@radix-ui/react-switch": "^1.2.4",
  "@radix-ui/react-tabs": "^1.1.11",
  "@radix-ui/react-toast": "^1.2.13",
  "@radix-ui/react-tooltip": "^1.2.6"
}
```

#### Styling & Utilities
```json
{
  "tailwindcss": "^3.4.17",
  "tailwindcss-animate": "^1.0.7",
  "tailwind-merge": "^3.3.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.510.0"
}
```

#### Form & Validation
```json
{
  "react-hook-form": "^7.56.3",
  "@hookform/resolvers": "^5.0.1",
  "zod": "^3.24.4"
}
```

#### Additional Libraries
```json
{
  "date-fns": "^3.6.0",
  "recharts": "^2.15.3",
  "sonner": "^2.0.3",
  "uuid": "^11.1.0"
}
```

### Step 4: Create Environment File

Create a `.env` file in the root directory:

```bash
# Create .env file
touch .env
```

Add the following content:

```env
# Frontend runs on this port
VITE_PORT=5173

# Backend API URL (if using backend)
VITE_API_BASE_URL=http://localhost:3000/api

# WebSocket URL (for real-time features)
VITE_WS_URL=ws://localhost:3000

# File upload URL (if using separate upload service)
VITE_UPLOAD_URL=http://localhost:3000/upload
```

### Step 5: Run the Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at:
- **Local**: http://localhost:5173
- **Network**: http://192.168.x.x:5173 (for testing on other devices)

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint

# Type checking
npm run typecheck
```

---

## Backend Setup (Optional)

If you want to replace mock data with a real backend, follow these steps:

### Step 1: Create Backend Project

```bash
# Create a new directory for backend
mkdir questclash-backend
cd questclash-backend

# Initialize Node.js project
npm init -y
```

### Step 2: Install Backend Dependencies

```bash
# Core dependencies
npm install express cors dotenv

# Database (choose one)
npm install pg prisma          # PostgreSQL with Prisma
# OR
npm install mongoose           # MongoDB

# Authentication
npm install jsonwebtoken bcrypt

# File upload
npm install multer

# Real-time features
npm install socket.io

# Validation
npm install joi

# Development dependencies
npm install --save-dev typescript @types/node @types/express @types/cors nodemon ts-node
```

### Step 3: Backend Project Structure

```
questclash-backend/
├── src/
│   ├── controllers/
│   │   ├── questController.ts
│   │   ├── userController.ts
│   │   ├── submissionController.ts
│   │   └── leaderboardController.ts
│   ├── models/
│   │   ├── Quest.ts
│   │   ├── User.ts
│   │   ├── Submission.ts
│   │   └── Vote.ts
│   ├── routes/
│   │   ├── questRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── submissionRoutes.ts
│   │   └── authRoutes.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── upload.ts
│   │   └── errorHandler.ts
│   ├── services/
│   │   ├── questService.ts
│   │   ├── userService.ts
│   │   └── rewardService.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── validation.ts
│   ├── config/
│   │   └── database.ts
│   └── server.ts
├── .env
├── package.json
└── tsconfig.json
```

### Step 4: Backend Environment Variables

Create `.env` file in backend directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database (PostgreSQL example)
DATABASE_URL=postgresql://username:password@localhost:5432/questclash

# Or MongoDB
# MONGODB_URI=mongodb://localhost:27017/questclash

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# AWS S3 (if using)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=questclash-uploads
AWS_REGION=us-east-1
```

### Step 5: Basic Express Server

Create `src/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'QuestClash API is running' });
});

// Import and use routes here
// app.use('/api/quests', questRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/submissions', submissionRoutes);
// app.use('/api/auth', authRoutes);

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### Step 6: Run Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

---

## Database Setup

### Option 1: PostgreSQL

#### Install PostgreSQL

**Windows:**
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Remember the password you set for the postgres user

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database

```bash
# Access PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE questclash;

# Create user (optional)
CREATE USER questclash_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE questclash TO questclash_user;

# Exit
\q
```

#### Setup Prisma (ORM)

```bash
# In backend directory
npm install prisma @prisma/client

# Initialize Prisma
npx prisma init

# Create schema in prisma/schema.prisma
# Then run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### Option 2: MongoDB

#### Install MongoDB

**Windows:**
1. Download from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Install as a Windows Service

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
```

#### Create Database

```bash
# Access MongoDB shell
mongosh

# Create database (automatically created when you insert data)
use questclash

# Create collections
db.createCollection("users")
db.createCollection("quests")
db.createCollection("submissions")
db.createCollection("votes")

# Exit
exit
```

---

## Running the Application

### Full Stack (Frontend + Backend)

#### Terminal 1 - Backend
```bash
cd questclash-backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd questclash
npm run dev
```

### Frontend Only (Mock Data)

```bash
cd questclash
npm run dev
```

The app will run with in-memory mock data (no backend needed).

---

## Project Structure

```
questclash/
├── public/                    # Static files
│   └── robots.txt
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # Shadcn UI components (read-only)
│   │   └── AppSidebar.tsx   # Custom components
│   ├── data/                # Data stores (mock or API)
│   │   ├── questStore.ts
│   │   └── leaderboardStore.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── use-toast.ts
│   │   └── use-mobile.tsx
│   ├── lib/                 # Utility functions
│   │   └── utils.ts
│   ├── pages/               # Page components
│   │   ├── Index.tsx
│   │   ├── BrowseQuests.tsx
│   │   ├── QuestDetails.tsx
│   │   ├── CreateQuest.tsx
│   │   ├── MyQuests.tsx
│   │   ├── Voting.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Profile.tsx
│   │   ├── ClaimXP.tsx
│   │   └── NotFound.tsx
│   ├── services/            # API services (create these)
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── upload.ts
│   │   └── websocket.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── .env                      # Environment variables
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── BACKEND_INTEGRATION_GUIDE.md
└── LOCAL_SETUP_GUIDE.md
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:** `Port 5173 is already in use`

**Solution:**
```bash
# Find and kill the process using the port
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Or change the port in vite.config.ts
```

#### 2. Module Not Found Errors

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or clear npm cache
npm cache clean --force
npm install
```

#### 3. TypeScript Errors

**Error:** Type errors during build

**Solution:**
```bash
# Run type checking
npm run typecheck

# Check tsconfig.json settings
# Ensure all @types packages are installed
```

#### 4. Tailwind Styles Not Working

**Solution:**
```bash
# Ensure Tailwind is properly configured
# Check tailwind.config.js content paths
# Restart dev server
npm run dev
```

#### 5. CORS Errors (with backend)

**Error:** `Access to fetch at 'http://localhost:3000' from origin 'http://localhost:5173' has been blocked by CORS`

**Solution:**
```javascript
// In backend server.ts
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

#### 6. Database Connection Errors

**PostgreSQL:**
```bash
# Check if PostgreSQL is running
# Windows
pg_ctl status

# macOS/Linux
sudo systemctl status postgresql
```

**MongoDB:**
```bash
# Check if MongoDB is running
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl status mongod
```

---

## Performance Optimization

### Development
```bash
# Use faster package manager (optional)
npm install -g pnpm
pnpm install
pnpm dev
```

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

### Build Output
```
dist/
├── assets/
│   ├── index-[hash].js      # Optimized JavaScript
│   └── index-[hash].css     # Optimized CSS
└── index.html
```

---

## Additional Tools (Optional)

### VS Code Extensions
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **TypeScript Vue Plugin (Volar)** - Better TypeScript support
- **Error Lens** - Inline error display

### Browser Extensions
- **React Developer Tools** - Debug React components
- **Redux DevTools** - Debug state (if using Redux)

---

## Next Steps

1. ✅ Install Node.js and npm
2. ✅ Clone/download the project
3. ✅ Run `npm install`
4. ✅ Create `.env` file
5. ✅ Run `npm run dev`
6. ✅ Open http://localhost:5173
7. 📖 Read `BACKEND_INTEGRATION_GUIDE.md` to connect a real backend
8. 🎨 Customize the app to your needs

---

## Support & Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Shadcn/UI Documentation](https://ui.shadcn.com/)
- [React Query Documentation](https://tanstack.com/query/latest)

### Community
- [React Discord](https://discord.gg/react)
- [Tailwind Discord](https://discord.gg/tailwindcss)

---

## Summary

**Minimum Setup (Frontend Only):**
```bash
# 1. Install Node.js 18+
# 2. Clone project
# 3. Install dependencies
npm install

# 4. Run dev server
npm run dev

# 5. Open browser
# http://localhost:5173
```

**Full Stack Setup:**
```bash
# Frontend
cd questclash
npm install
npm run dev

# Backend (separate terminal)
cd questclash-backend
npm install
npm run dev

# Database
# Install PostgreSQL or MongoDB
# Create database
# Run migrations
```

**That's it! You're ready to start developing QuestClash! 🎮🚀**