# 💰 SAVVY - Smart Personal Finance Companion

## 📌 Overview
SAVVY is a full-stack personal finance management application that helps users track income, expenses, and budget goals with intelligent alerts and recommendations.  
The app provides a **comprehensive dashboard** with data visualizations, budget monitoring, and personalized financial insights to help users make informed financial decisions.

---

## 🏗️ System Architecture

### 🎨 Frontend
- **Framework**: React + TypeScript  
- **Styling**: TailwindCSS + Shadcn/ui  
- **State Management**: TanStack Query  
- **Routing**: Wouter  
- **Forms**: React Hook Form + Zod validation  
- **Charts**: Chart.js with interactive financial visualizations  

### ⚙️ Backend
- **Runtime**: Node.js + Express  
- **Authentication**: Passport.js (local strategy, session-based)  
- **Password Security**: Crypto (scrypt for hashing)  
- **Session Management**: Express sessions + PostgreSQL store  
- **API**: RESTful endpoints with proper status codes and error handling  

### 🗄️ Database
- **Database**: PostgreSQL (Neon serverless hosting)  
- **ORM**: Drizzle ORM  
- **Schema**:
  - Users (authentication + profile)  
  - Transactions (income/expenses)  
  - Budgets (monthly category-wise limits)  
  - Goals (savings and targets)  
  - Notifications (alerts & recommendations)  
- **Validation**: Zod schemas  

---

## ✨ Key Features
- 📊 **Transaction Management** – Add, edit, delete, and categorize transactions (Food, Transport, Entertainment, etc.)  
- 💡 **Budget Monitoring** – Rule-based alerts when spending approaches limits  
- 🔔 **Smart Alerts** – Real-time notifications at 80%+ spending thresholds  
- 📈 **Analytics Dashboard** – Overview cards, trend charts, and spending breakdowns  
- 🎨 **Data Visualization** – Interactive pie charts, line charts, and progress bars  

---

## 🔐 Security & Authentication
- HTTP-only cookies for session security  
- Salted + hashed passwords with timing-safe comparison  
- Authentication middleware for protected API routes  
- Strict input validation with Zod schemas  

---

## 🛠️ Development Tools
- **Build System**: Vite  
- **Language**: TypeScript (strict mode)  
- **Monorepo**: Shared schemas & utilities  
- **Dev Experience**: Hot reload, error overlays, optimized builds  

---

## 📦 External Dependencies

### 🗄️ Database & Hosting
- Neon (Serverless PostgreSQL)  
- `ws` (WebSocket support)  

### 🎨 UI & Styling
- Radix UI (headless components)  
- TailwindCSS (utility-first styling)  
- Lucide React (icons)  

### 📊 Data Visualization
- Chart.js + React Chart.js 2  

### 📝 Form Management
- React Hook Form  
- Zod (validation)  

### 🔐 Auth & Session
- Passport.js  
- Connect PG Simple (Postgres session store)  
- Crypto / BCrypt (secure hashing)  

### ⚙️ Dev Dependencies
- Replit Integration (optional)  
- ESBuild  
- TSX  

---

