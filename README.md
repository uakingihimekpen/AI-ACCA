# ACCA Betting Tips - Sports Betting Accumulator Platform

A full-stack sports betting accumulator platform with **Android app** (Flutter) and **Windows web app** (Next.js PWA) sharing one backend API.

## 📋 Project Overview

Publishes daily sports betting accumulators (5 & 10 odds free, 20 odds VIP), multi-day rollovers, tracks win/loss history transparently, and monetizes via VIP tier and donations.

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Android App   │     │  Windows Web App │     │   Admin Panel   │
│    (Flutter)    │     │  (Next.js PWA)   │     │  (Web-only)     │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                      │                         │
         └──────────────────────┼─────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   REST API (Express)  │
                    │   Port: 5000          │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   PostgreSQL DB       │
                    └───────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- Flutter SDK (for Android app)
- npm or yarn

### 1. Backend Setup

```bash
cd backend
cp .env.example .env    # Edit with your DB credentials
npm install
npm run migrate         # Creates database tables
npm run seed            # Creates admin user
npm run dev             # Starts on http://localhost:5000
```

### 2. Web App Setup

```bash
cd webapp
npm install
npm run dev             # Starts on http://localhost:3000
```

### 3. Android App Setup

```bash
cd flutter_app
flutter pub get
flutter run              # Requires connected device/emulator
```

## 🔑 Default Credentials

| Role  | Email              | Password    |
|-------|--------------------|-------------|
| Admin | admin@accaapp.com  | Admin@123456|

## 📁 Project Structure

### Backend (`backend/`)
```
backend/
├── src/
│   ├── index.js              # Entry point, Express server
│   ├── db/
│   │   ├── schema.sql        # PostgreSQL schema (all tables)
│   │   ├── pool.js           # Database connection pool
│   │   ├── migrate.js        # Run migrations
│   │   └── seed.js           # Seed admin user
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication + optional auth
│   │   └── admin.js          # Admin role check
│   ├── controllers/
│   │   ├── authController.js       # Register, login, profile
│   │   ├── accumulatorController.js # Today, history, stats
│   │   ├── rolloverController.js    # Active, history, by ID
│   │   ├── vipController.js         # Plans, payment, status
│   │   ├── donationController.js    # Paystack, bank transfer
│   │   ├── ratingController.js      # Submit, get ratings
│   │   └── adminController.js       # All admin operations
│   └── routes/
│       ├── auth.js           # /api/auth/*
│       ├── accumulators.js   # /api/accumulators/*
│       ├── rollovers.js      # /api/rollovers/*
│       ├── vip.js            # /api/vip/*
│       ├── donations.js      # /api/donations/*
│       ├── ratings.js        # /api/ratings/*
│       └── admin.js          # /api/admin/*
├── .env                      # Environment variables
└── package.json
```

### Web App (`webapp/`) - Next.js 14 + Tailwind
```
webapp/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with footer
│   │   ├── page.tsx             # Homepage (today's accumulators)
│   │   ├── globals.css          # Global styles + Tailwind
│   │   ├── history/page.tsx     # History with filters
│   │   ├── rollovers/page.tsx   # Rollover programs
│   │   ├── vip/page.tsx         # VIP subscription plans
│   │   ├── donate/page.tsx      # Donations page
│   │   └── admin/
│   │       ├── layout.tsx           # Admin sidebar layout
│   │       ├── page.tsx             # Dashboard
│   │       ├── accumulators/page.tsx # Create/grade accumulators
│   │       ├── rollovers/page.tsx    # Manage rollovers
│   │       ├── donations/page.tsx    # Confirm donations
│   │       └── analytics/page.tsx    # Analytics dashboard
│   ├── components/
│   │   ├── Navbar.tsx           # Navigation + auth modal
│   │   ├── AccumulatorCard.tsx  # Accumulator display card
│   │   └── RolloverTracker.tsx  # Day-by-day rollover tracker
│   ├── context/
│   │   └── AuthContext.tsx      # Auth state management
│   └── lib/
│       └── api.ts               # API client (all endpoints)
├── public/
│   └── manifest.json            # PWA manifest
├── .env.local                   # NEXT_PUBLIC_API_URL
└── package.json
```

### Flutter App (`flutter_app/`)
```
flutter_app/
├── lib/
│   ├── main.dart                # App entry point + navigation
│   ├── services/
│   │   └── api_service.dart     # HTTP API client
│   ├── providers/
│   │   └── auth_provider.dart   # Auth state management
│   ├── screens/
│   │   ├── home_screen.dart     # Today's accumulators
│   │   ├── history_screen.dart  # Past accumulators
│   │   ├── rollovers_screen.dart # Rollover programs
│   │   ├── vip_screen.dart      # VIP plans
│   │   ├── donate_screen.dart   # Donations
│   │   └── login_screen.dart    # Auth screen
│   └── widgets/
│       ├── bottom_nav.dart      # Bottom navigation bar
│       ├── accumulator_card.dart # Accumulator card widget
│       └── rollover_tracker.dart # Rollover tracker widget
├── pubspec.yaml
└── assets/
    └── images/                  # App images
```

## 📡 API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/accumulators/today` | Today's accumulator (optional auth for VIP) |
| GET | `/api/accumulators/history` | History with filters |
| GET | `/api/accumulators/stats` | Win/loss statistics |
| GET | `/api/rollovers/active` | Active rollovers |
| GET | `/api/rollovers/history` | Past rollovers |
| GET | `/api/vip/plans` | VIP pricing plans |
| GET | `/api/donations/bank-details` | Bank transfer details |
| GET | `/api/donations/wall` | Donor wall |
| GET | `/api/ratings` | Public ratings |
| GET | `/api/health` | Health check |

### Authenticated Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/vip/status` | Check VIP status |
| POST | `/api/vip/initialize` | Initiate VIP payment |
| POST | `/api/vip/verify` | Verify VIP payment |
| POST | `/api/donations/paystack` | Paystack donation |
| POST | `/api/donations/bank-transfer` | Record bank transfer |
| POST | `/api/ratings` | Submit rating |

### Admin Endpoints (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/accumulators` | List all accumulators |
| POST | `/api/admin/accumulators` | Create accumulator |
| PUT | `/api/admin/accumulators/:id` | Update accumulator |
| POST | `/api/admin/accumulators/:id/grade` | Grade accumulator |
| GET | `/api/admin/rollovers` | List all rollovers |
| POST | `/api/admin/rollovers` | Create rollover |
| PUT | `/api/admin/rollovers/:id/days/:dayNumber` | Update rollover day |
| GET | `/api/admin/donations` | List donations |
| POST | `/api/admin/donations/:id/confirm` | Confirm donation |
| GET | `/api/admin/ratings` | List all ratings |
| POST | `/api/admin/ratings/:id/hide` | Hide rating |
| PUT | `/api/admin/vip-plans` | Update VIP plans |
| GET | `/api/admin/analytics` | Analytics dashboard |
| GET | `/api/admin/audit-logs` | Audit logs |

## 🗄️ Database Schema

### Tables
- **users** - User accounts with VIP status
- **accumulators** - Daily accumulator tips with selections and betslip codes
- **rollovers** - Multi-day rollover programs
- **rollover_days** - Individual days within rollovers
- **ratings** - User ratings and reviews
- **donations** - Paystack and bank transfer donations
- **vip_subscriptions** - VIP subscription records
- **audit_logs** - Admin action audit trail

## 💳 Monetization

### VIP Plans (configured in backend)
| Plan    | Price (₦) | Duration | Features |
|---------|-----------|----------|----------|
| Weekly  | 5,000     | 7 days   | 20 odds acca, rollovers, no ads |
| Monthly | 15,000    | 30 days  | All features |
| Yearly  | 120,000   | 365 days | All features + 33% discount |

### Payment Integration
- **Paystack** - Primary payment processor for subscriptions and donations
- **Direct Bank Transfer** - Manual admin-confirmed donations

## 🧪 Development Notes

### Backend
- Uses `dotenv` for environment variables
- JWT-based authentication with 7-day expiry
- Parameterized SQL queries to prevent injection
- Audit logging for all admin actions
- VIP content automatically locked for non-VIP users

### Web App
- Built with Next.js 14 App Router
- Tailwind CSS with dark mode support
- PWA-enabled with `next-pwa`
- Responsive design (mobile-first)
- Client-side auth with AuthContext
- Skeleton loading states

### Flutter App
- Uses Provider for state management
- SharedPreferences for token storage
- Material 3 design
- RefreshIndicator for pull-to-refresh
- API service with automatic token injection

## 🛠️ Common Issues & Fixes

### Backend won't start
- Ensure PostgreSQL is running
- Check `.env` database URL is correct
- Run `npm run migrate` to create tables

### Web app can't connect to backend
- Ensure backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- For Windows: use `http://localhost:5000`

### Flutter can't connect to backend
- Android emulator: use `http://10.0.2.2:5000`
- Physical device: use your machine's local IP
- Ensure `android:usesCleartextTraffic="true"` in AndroidManifest.xml

## 🔒 Security Notes
- Never commit `.env` files to version control
- Change JWT_SECRET in production
- Use HTTPS in production
- Add Paystack webhook verification
- Rate-limit API endpoints
- Add input validation/sanitization

## 📱 PWA Installation (Windows)
1. Open web app in Chrome/Edge
2. Click the install icon in the address bar
3. App installs as a standalone desktop app
4. Works offline with cached content

## 🤖 AI Development Guide

### For AI Agents Working on This Codebase

1. **Backend first**: Always start with the API since both clients depend on it
2. **Database changes**: Update `schema.sql` first, then controllers, then routes
3. **API changes**: Update both the backend route + controller, then update `api.ts` (web) and `api_service.dart` (Flutter)
4. **UI changes**: 
   - Web: Modify pages in `webapp/src/app/`, components in `webapp/src/components/`
   - Flutter: Modify screens in `flutter_app/lib/screens/`, widgets in `flutter_app/lib/widgets/`
5. **Testing**: No test suite yet - add tests in `backend/tests/` and `webapp/__tests__/`
6. **Type safety**: Web app uses TypeScript, Flutter uses Dart - both are strongly typed
7. **State management**: Web uses React Context, Flutter uses Provider
8. **API client pattern**: Both clients use the same endpoint structure - any new endpoint needs updates in both clients

### To Add a New Feature
1. Add database migration to `schema.sql`
2. Add controller logic in `backend/src/controllers/`
3. Add route in `backend/src/routes/`
4. Register route in `backend/src/index.js`
5. Add API method in `webapp/src/lib/api.ts`
6. Add API method in `flutter_app/lib/services/api_service.dart`
7. Create UI components/pages in both clients

## 📄 License
Private - All rights reserved