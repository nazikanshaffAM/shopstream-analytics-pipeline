CREATE TABLE customers (
    customer_id VARCHAR(10) PRIMARY KEY,
    name TEXT,
    email TEXT,
    gender VARCHAR(10),
    city TEXT,
    country VARCHAR(5),
    signup_date DATE,
    age INT,
    tier VARCHAR(20)
);


CREATE TABLE orders (
    order_id VARCHAR(20) PRIMARY KEY,
    customer_id VARCHAR(10),
    order_date DATE,
    status VARCHAR(20),
    channel VARCHAR(20),
    discount_pct NUMERIC(4,2),
    shipping_country VARCHAR(5),

    FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
);



CREATE TABLE products (
    product_id VARCHAR(10) PRIMARY KEY,
    name TEXT,
    category TEXT,
    sub_category TEXT,
    price NUMERIC(10,2),
    cost NUMERIC(10,2),
    stock_qty INT,
    is_active BOOLEAN
);




CREATE TABLE order_items (
    item_id VARCHAR(20) PRIMARY KEY,
    order_id VARCHAR(20),
    product_id VARCHAR(10),
    quantity INT,
    unit_price NUMERIC(10,2),
    returned BOOLEAN,

    FOREIGN KEY (order_id)
        REFERENCES orders(order_id),

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
);



CREATE TABLE events (
    event_id VARCHAR(20) PRIMARY KEY,
    session_id TEXT,
    customer_id VARCHAR(10),
    event_type TEXT,
    product_id VARCHAR(10),
    timestamp TIMESTAMP,
    device VARCHAR(20)

);
