# 🎯 AI ACCA - Sports Betting Accumulator Platform

A full-stack sports betting accumulator (ACCA) platform that delivers daily betting tips, rollover programs, VIP subscriptions, and community features across web and mobile.

## 📱 Platform Overview

| Component | Technology | Description |
|-----------|-----------|-------------|
| **Backend API** | Node.js, Express, PostgreSQL | RESTful API handling auth, accumulators, rollovers, VIP, donations, ratings & admin |
| **Web App** | Next.js 14, TypeScript, Tailwind CSS | Responsive PWA with admin dashboard, VIP & donation pages |
| **Mobile App** | Flutter | Cross-platform mobile app for Android & Windows with push notifications |

---

## 🏗️ Project Structure

```
AI ACCA/
├── backend/               # Node.js + Express REST API
│   ├── src/
│   │   ├── index.js       # Server entry point
│   │   ├── controllers/   # Business logic (auth, accumulators, rollovers, etc.)
│   │   ├── routes/         # API route definitions
│   │   ├── middleware/     # Auth & admin guards
│   │   └── db/             # Schema, migrations, seed & connection pool
│   └── package.json
│
├── webapp/                # Next.js 14 web application
│   ├── src/
│   │   ├── app/           # Pages (home, admin, donate, history, rollovers, vip)
│   │   ├── components/     # AccumulatorCard, Navbar, RolloverTracker
│   │   ├── context/        # AuthContext
│   │   └── lib/            # API client
│   └── package.json
│
└── flutter_app/           # Flutter mobile application
    ├── lib/
    │   ├── screens/        # Home screen
    │   ├── widgets/         # AccumulatorCard, BottomNav, RolloverTracker
    │   ├── services/        # API service
    │   ├── providers/       # Auth provider
    │   └── models/
    └── pubspec.yaml
```

---

## ✨ Features

### 🎫 Accumulators
- Daily betting tips across **5, 10, and 20-fold** tiers
- Combined odds calculation
- Bet slip codes for **Bet9ja, SportyBet, and iXBet**
- Win/loss/void grading with status tracking
- VIP-only accumulator tiers

### 🔄 Rollover Programs
- **7-day** and **15-day** rollover challenges
- **2-odds** and **5-odds** variants
- Daily selection tracking with pass/fail status
- VIP-exclusive programs

### 👑 VIP Subscriptions
- Weekly, monthly, and yearly plans
- Paystack payment integration
- Automatic subscription expiry handling
- VIP-only content access

### 💰 Donations
- Paystack and bank transfer support
- Donor wall with public display option
- Admin confirmation workflow

### ⭐ Community
- 5-star rating system with comments
- User authentication (JWT)
- Admin moderation of ratings

### 🛡️ Admin Dashboard
- Manage accumulators, rollovers & donations
- Analytics and reporting
- User management & VIP administration
- Audit logging

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (v14+)
- **Flutter SDK** (v3.0+)
- **npm** or **yarn**

### 1. Backend Setup

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations & seed data
npm run migrate
npm run seed

# Start the development server
npm run dev
```

The API will be available at `http://localhost:5000`.

#### Environment Variables (`backend/.env`)

```
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/acca_betting
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 2. Web App Setup

```bash
cd webapp
npm install

# Configure environment variables
cp .env.local.example .env.local

# Start the development server
npm run dev
```

The web app will be available at `http://localhost:3000`.

#### Environment Variables (`webapp/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Flutter App Setup

```bash
cd flutter_app
flutter pub get
flutter run
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/accumulators` | List accumulators |
| `GET` | `/api/accumulators/:id` | Get accumulator details |
| `GET` | `/api/rollovers` | List rollover programs |
| `GET` | `/api/rollovers/:id` | Get rollover details |
| `GET` | `/api/vip/plans` | List VIP plans |
| `POST` | `/api/vip/subscribe` | Subscribe to VIP |
| `GET` | `/api/donations` | List donations |
| `POST` | `/api/donations` | Create donation |
| `GET` | `/api/ratings` | List ratings |
| `POST` | `/api/ratings` | Submit rating |
| `GET` | `/api/admin/*` | Admin management endpoints |
| `GET` | `/api/health` | Health check |

---

## 🗄️ Database Schema

The PostgreSQL database includes the following tables:

- **users** - User accounts with roles, VIP status & platform tracking
- **accumulators** - Daily betting tips with tiers, odds & grading
- **rollovers** - Rollover challenge programs
- **rollover_days** - Daily selections within rollover programs
- **ratings** - User ratings & comments
- **donations** - Donation records with payment methods
- **vip_subscriptions** - VIP plan subscriptions
- **audit_logs** - Admin action audit trail

---

## 🛠️ Tech Stack

### Backend
- **Express** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Paystack** - Payment processing

### Web App
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **next-pwa** - Progressive Web App support
- **lucide-react** - Icons

### Mobile App
- **Flutter** - Cross-platform UI framework
- **Provider** - State management
- **Firebase** - Push notifications
- **flutter_secure_storage** - Secure token storage
- **in_app_review** - App store reviews

---

## 📜 Scripts

### Backend
| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start dev server with hot reload |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed database with sample data |

### Web App
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📧 Contact

Project Link: [https://github.com/uakingihimekpen/AI-ACCA](https://github.com/uakingihimekpen/AI-ACCA)