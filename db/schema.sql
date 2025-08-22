-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    planned_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    rules TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    category_id INTEGER REFERENCES categories(id),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Investments table
CREATE TABLE investments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    shares DECIMAL(15, 4) NOT NULL,
    purchase_price DECIMAL(15, 2),
    purchase_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Settings table
CREATE TABLE user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    currency VARCHAR(10) DEFAULT 'USD',
    locale VARCHAR(10),
    monthly_income DECIMAL(15, 2) DEFAULT 0.00,
    monthly_investment DECIMAL(15, 2) DEFAULT 0.00,
    withdrawal_rate DECIMAL(5, 2) DEFAULT 4.00,
    enable_rollover BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX ON accounts (user_id);
CREATE INDEX ON categories (user_id);
CREATE INDEX ON transactions (account_id);
CREATE INDEX ON investments (user_id);

-- Net Worth Snapshots table
CREATE TABLE net_worth_snapshots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    net_worth DECIMAL(15, 2) NOT NULL,
    UNIQUE(user_id, date)
);

-- Categorization Suggestions table
CREATE TABLE categorization_suggestions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    description_keyword VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    confidence_score INTEGER NOT NULL DEFAULT 1,
    UNIQUE(user_id, description_keyword, category_id)
);
