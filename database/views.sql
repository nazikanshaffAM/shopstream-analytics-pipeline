CREATE OR REPLACE VIEW fact_sales AS
SELECT
    oi.item_id,
    o.order_id,
    o.order_date,
    o.customer_id,
    o.status,
    o.channel,
    o.shipping_country,
    p.product_id,
    p.category,
    p.sub_category,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS revenue,
    oi.returned
FROM order_items oi
JOIN orders o ON oi.order_id = o.order_id
JOIN products p ON oi.product_id = p.product_id;


CREATE OR REPLACE VIEW customer_metrics AS
SELECT
    o.customer_id,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(oi.quantity * oi.unit_price) AS total_revenue,
    AVG(oi.quantity * oi.unit_price) AS avg_item_revenue,
    MIN(o.order_date) AS first_order_date,
    MAX(o.order_date) AS last_order_date
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.customer_id;


CREATE OR REPLACE VIEW product_metrics AS
SELECT
    p.product_id,
    p.name,
    p.category,
    p.sub_category,
    SUM(oi.quantity) AS total_units_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue,
    SUM(CASE WHEN oi.returned THEN 1 ELSE 0 END) AS returned_items_count,
    COUNT(oi.item_id) AS total_item_rows
FROM products p
LEFT JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY
    p.product_id,
    p.name,
    p.category,
    p.sub_category;


CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT
    DATE(o.order_date) AS sales_date,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(oi.quantity) AS total_quantity_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY DATE(o.order_date)
ORDER BY sales_date;


CREATE OR REPLACE VIEW channel_performance AS
SELECT
    o.channel,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(oi.quantity) AS total_quantity_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.channel;


CREATE OR REPLACE VIEW event_funnel_summary AS
SELECT
    event_type,
    COUNT(*) AS event_count
FROM events
GROUP BY event_type
ORDER BY event_count DESC;
