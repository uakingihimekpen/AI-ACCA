-- Database Schema for ACCA Betting App

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_vip BOOLEAN DEFAULT false,
    vip_plan VARCHAR(50),
    vip_expiry TIMESTAMP,
    paystack_customer_code VARCHAR(255),
    platform VARCHAR(20) DEFAULT 'web' CHECK (platform IN ('android', 'web')),
    fcm_token VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Accumulators table
CREATE TABLE IF NOT EXISTS accumulators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    tier INTEGER NOT NULL CHECK (tier IN (5, 10, 20)),
    selections JSONB NOT NULL DEFAULT '[]',
    combined_odds DECIMAL(10,2) NOT NULL,
    is_vip BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void')),
    betslip_codes JSONB DEFAULT '{"bet9ja": "", "sportybet": "", "ixbet": ""}',
    created_by UUID REFERENCES users(id),
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Rollovers table
CREATE TABLE IF NOT EXISTS rollovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program VARCHAR(10) NOT NULL CHECK (program IN ('7day', '15day')),
    variant VARCHAR(10) NOT NULL CHECK (variant IN ('2odds', '5odds')),
    is_vip BOOLEAN DEFAULT true,
    start_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Rollover days table
CREATE TABLE IF NOT EXISTS rollover_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rollover_id UUID REFERENCES rollovers(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE NOT NULL,
    selections JSONB DEFAULT '[]',
    odds DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'pass', 'fail')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(rollover_id, day_number)
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
    comment TEXT,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(20) NOT NULL CHECK (method IN ('paystack', 'bank_transfer')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
    paystack_reference VARCHAR(255),
    paystack_access_code VARCHAR(255),
    bank_name VARCHAR(100),
    account_number VARCHAR(20),
    account_name VARCHAR(255),
    donor_name VARCHAR(100),
    show_on_wall BOOLEAN DEFAULT false,
    confirmed_by UUID REFERENCES users(id),
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- VIP subscriptions table
CREATE TABLE IF NOT EXISTS vip_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('weekly', 'monthly', 'yearly')),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    paystack_subscription_code VARCHAR(255),
    paystack_authorization_code VARCHAR(255),
    start_date TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accumulators_date ON accumulators(date DESC);
CREATE INDEX IF NOT EXISTS idx_accumulators_tier ON accumulators(tier);
CREATE INDEX IF NOT EXISTS idx_accumulators_status ON accumulators(status);
CREATE INDEX IF NOT EXISTS idx_rollovers_status ON rollovers(status);
CREATE INDEX IF NOT EXISTS idx_rollover_days_rollover_id ON rollover_days(rollover_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_vip ON users(is_vip);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_ratings_stars ON ratings(stars);