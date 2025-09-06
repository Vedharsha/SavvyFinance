# SAVVY - Smart Personal Finance Companion

## Overview

SAVVY is a full-stack personal finance management application that helps users track income, expenses, and budget goals with intelligent alerts and recommendations. The application provides a comprehensive dashboard with data visualizations, budget monitoring, and personalized financial insights to help users make informed financial decisions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and component-based UI development
- **Styling**: TailwindCSS with Shadcn/ui component library for consistent, accessible design system
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Charts**: Chart.js integration for financial data visualization (pie charts, line charts, progress bars)

### Backend Architecture
- **Runtime**: Node.js with Express framework for RESTful API endpoints
- **Authentication**: Passport.js with local strategy using session-based authentication
- **Password Security**: Crypto module with scrypt for secure password hashing
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Structure**:
  - Users table with authentication credentials and profile data
  - Transactions table with categorized income/expense tracking
  - Budgets table for monthly category-wise spending limits
  - Goals table for savings and financial targets
  - Notifications table for alerts and recommendations
- **Data Validation**: Zod schemas for runtime type checking and validation

### Key Features Implementation
- **Transaction Management**: CRUD operations with categorization (Food, Transportation, Entertainment, etc.)
- **Budget Monitoring**: Rule-based engine that compares spending against monthly budgets
- **Alert System**: Real-time notifications when approaching budget thresholds (e.g., 80% spending)
- **Analytics Dashboard**: Financial overview cards, spending breakdowns, and trend analysis
- **Data Visualization**: Interactive charts showing category spending, monthly trends, and budget progress

### Security & Authentication
- **Session Security**: Secure session configuration with HTTP-only cookies
- **Password Protection**: Salted password hashing with timing-safe comparison
- **Route Protection**: Authentication middleware for protected API endpoints
- **Input Validation**: Comprehensive validation using Zod schemas

### Development Tools
- **Build System**: Vite for fast development and optimized production builds
- **Type Checking**: TypeScript with strict configuration across frontend and backend
- **Code Organization**: Monorepo structure with shared schemas and utilities
- **Development Experience**: Hot reload, error overlays, and development tooling

## External Dependencies

### Database & Hosting
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Real-time database connections using ws library

### UI Components & Styling
- **Radix UI**: Headless UI components for accessibility and consistency
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

### Data Visualization
- **Chart.js**: Canvas-based charting library for financial data visualization
- **React Chart.js 2**: React wrapper for Chart.js integration

### Form Management
- **React Hook Form**: Performant form library with minimal re-renders
- **Hookform Resolvers**: Zod integration for form validation

### Authentication & Session
- **Passport.js**: Authentication middleware with local strategy
- **Connect PG Simple**: PostgreSQL session store for Express sessions
- **BCrypt**: Password hashing library for secure authentication

### Development Dependencies
- **Replit Integration**: Development environment optimizations and tooling
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server