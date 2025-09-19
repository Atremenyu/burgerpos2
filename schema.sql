-- Categories Table
CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);

-- Products Table
CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price REAL NOT NULL,
    combo_price REAL,
    category TEXT NOT NULL,
    image TEXT,
    stock INTEGER NOT NULL,
    ingredients JSONB
);

-- Ingredients Table
CREATE TABLE ingredients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    stock INTEGER NOT NULL,
    unit TEXT NOT NULL
);

-- Users Table
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    pin TEXT NOT NULL,
    role_id uuid REFERENCES roles(id)
);

-- Roles Table
CREATE TABLE roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    permissions TEXT[]
);

-- Order Types Table
CREATE TABLE order_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);

-- Payment Methods Table
CREATE TABLE payment_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_platform_payment BOOLEAN NOT NULL
);

-- Delivery Platforms Table
CREATE TABLE delivery_platforms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    requires_platform_payment BOOLEAN NOT NULL
);

-- Orders Table
CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    items JSONB,
    total REAL NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    order_type TEXT NOT NULL,
    delivery_platform TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    prep_time INTEGER,
    user_id uuid REFERENCES users(id),
    user_name TEXT,
    shift_id uuid,
    transaction_id TEXT
);

-- Expenses Table
CREATE TABLE expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL
);

-- Shifts Table
CREATE TABLE shifts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id),
    user_name TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    orders JSONB,
    total_sales REAL NOT NULL
);
