CREATE TABLE IF NOT EXISTS stock_batches (
    id SERIAL PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    seed_name TEXT NOT NULL,
    lot_no TEXT UNIQUE NOT NULL,
    arrival_date DATE DEFAULT CURRENT_DATE,
    total_packets_initial INTEGER NOT NULL,
    total_weight_initial NUMERIC NOT NULL,
    packets_available INTEGER NOT NULL,
    cost_per_packet NUMERIC NOT NULL,
    total_stock_value NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    stock_batch_id INTEGER REFERENCES stock_batches(id),
    packets_sold INTEGER NOT NULL,
    amount_paid NUMERIC NOT NULL,
    profit NUMERIC NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT,
    expense_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
