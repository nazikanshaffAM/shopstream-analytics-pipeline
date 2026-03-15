# ShopStream Analytics Pipeline

An end-to-end **data engineering pipeline** for a simulated e-commerce platform.
This project generates synthetic operational and behavioral data, loads it into a PostgreSQL analytical database, and prepares it for analytics and dashboarding.

## Highlights

- automated data pipelines
- relational schema design
- reproducible data ingestion
- scalable analytics architecture

---

## Project Architecture

The system follows a typical modern analytics architecture:

```
Synthetic Data Generator (Python)
↓
CSV Dataset Files
↓
ETL Loader Pipeline
↓
PostgreSQL Analytical Database
↓
Semantic Layer (Cube.js)
↓
React Analytics Dashboard
```

This layered design separates **data generation, storage, modeling, and visualization**, a common pattern in modern analytics platforms.

---

## Project Structure

```
shopstream-analytics-pipeline
│
├── pipeline
│   ├── dataset_script.py
│   ├── load_data.py
│   └── run_pipeline.py
│
├── database
│   ├── schema.sql
│   └── views.sql
│
├── data
│   └── raw
│       ├── customers.csv
│       ├── products.csv
│       ├── orders.csv
│       ├── order_items.csv
│       └── events.csv
│
├── cubejs
├── dashboard
│
├── notebooks
│   └── exploration.ipynb
│
├── docs
│   └── Case_Study_DS_Intern.pdf
│
├── .env
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

---

## Dataset Overview

The pipeline generates **five datasets** representing an e-commerce system.

| Dataset | Description |
|------|------|
| customers | Customer demographic and account information |
| products | Product catalog and pricing |
| orders | Customer order transactions |
| order_items | Line-item purchase details |
| events | User behavior and engagement events |

These datasets simulate both **transactional data** and **behavioral analytics data** used in real-world e-commerce systems.

---

## Database Schema

The PostgreSQL schema is designed to support analytical queries efficiently.

### Tables

- `customers`
- `products`
- `orders`
- `order_items`
- `events`

### Relationships

```
customers
↑
│
orders
↑
│
order_items
│
└── products
```

### Key Relationships

| Relationship | Description |
|------|------|
| orders.customer_id -> customers.customer_id | Links orders to customers |
| order_items.order_id -> orders.order_id | Links order items to orders |
| order_items.product_id -> products.product_id | Links purchased items to products |

This schema supports use cases across sales, customer, product, and behavior domains, including:

- revenue analysis by product, geography, channel, and time
- customer segmentation and repeat purchase behavior
- order status and average order value trends
- product performance and low-performing item analysis
- event-based funnel analysis (view -> cart -> checkout -> purchase)

---

## Pipeline Components

### 1) Synthetic Data Generator

**File:** `pipeline/dataset_script.py`

Generates realistic synthetic data using:

- Faker
- NumPy
- Pandas

Outputs CSV files to `data/raw/`:

- `customers.csv`
- `products.csv`
- `orders.csv`
- `order_items.csv`
- `events.csv`

### 2) Database Schema Definition

**File:** `database/schema.sql`

Defines PostgreSQL tables and relationships.

The schema ensures:

- primary keys
- foreign key constraints
- consistent data types
- analytical query compatibility

### 3) ETL Data Loader

**File:** `pipeline/load_data.py`

Performs ETL:

- **Extract:** reads CSV files from `data/raw/`
- **Transform:** converts timestamps, normalizes data types, prepares records
- **Load:** inserts records into PostgreSQL using SQLAlchemy

### 4) Pipeline Runner

**File:** `pipeline/run_pipeline.py`

Orchestrates the end-to-end pipeline:

1. generate synthetic dataset
2. load CSV files into PostgreSQL

---

## Environment Setup

Create a virtual environment:

```bash
python -m venv .venv
```

Activate the environment:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE shopstream_analytics;
```

Run the schema definition:

```sql
\i database/schema.sql
```

---

## Running the Pipeline

After environment and database setup, run:

```bash
python pipeline/run_pipeline.py
```

This command will:

1. generate synthetic datasets
2. load all datasets into PostgreSQL tables

---

## Verifying the Pipeline

Run:

```sql
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM order_items;
SELECT COUNT(*) FROM events;
```

Each table should return populated records.

---

## Analytical Views

To simplify downstream analytics and dashboarding, several SQL views are created on top of the relational schema:

- `fact_sales` for item-level sales analytics
- `customer_metrics` for customer-level purchase summaries
- `product_metrics` for product performance analysis
- `daily_sales_summary` for time-series sales trends
- `channel_performance` for channel-based KPI analysis
- `event_funnel_summary` for behavioral funnel tracking

These views make it easier to build analytical queries, semantic models, and dashboard visualizations.

---

## Technologies Used

### Data Engineering

- Python
- Pandas
- NumPy
- Faker
- SQLAlchemy
- PostgreSQL

### Analytics Layer

- Cube.js

### Visualization

- React
- Recharts

---

## Key Design Considerations

### Reproducibility

The entire pipeline can be executed using a single command.

### Modularity

Data generation, ETL loading, and orchestration are separated into independent scripts.

### Analytical Schema

The relational schema supports common analytical queries used in e-commerce analytics.

### Scalability

The architecture can be extended to support larger datasets or additional data sources.

