# ShopStream Analytics Pipeline

An end-to-end **data engineering pipeline** for a simulated e-commerce platform.  
This project generates synthetic operational and behavioral data, loads it into a PostgreSQL analytical database, and prepares it for analytics and dashboarding.

The implementation demonstrates core data engineering practices including:

- automated data pipelines
- relational schema design
- reproducible data ingestion
- scalable analytics architecture

---

# Project Architecture

The system follows a typical modern analytics architecture.

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

This layered design separates **data generation, storage, modeling, and visualization**, which is a common architecture used in modern analytics platforms.

---

# Dataset Overview

The pipeline generates **five datasets representing an e-commerce system**.

| Dataset | Description |
|------|------|
| customers | Customer demographic and account information |
| products | Product catalog and pricing |
| orders | Customer order transactions |
| order_items | Line-item purchase details |
| events | User behavior and engagement events |

These datasets simulate both **transactional data** and **behavioral analytics data** used in real-world e-commerce systems.

---

# Database Schema

The PostgreSQL schema is designed to support analytical queries efficiently.

## Tables

- `customers`
- `products`
- `orders`
- `order_items`
- `events`

## Relationships

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
| orders.customer_id → customers.customer_id | Links orders to customers |
| order_items.order_id → orders.order_id | Links order items to orders |
| order_items.product_id → products.product_id | Links purchased items to products |

This schema supports a broad range of operational and analytical use cases across sales, customer, product, and behavioral domains, including:

- sales and revenue analysis by product, category, geography, channel, and time
- customer analytics such as segmentation, repeat purchasing, and purchase frequency
- order analytics including status distribution, discount patterns, and average order value
- product analytics such as top sellers, low-performing items, returns, and stock-related insights
- geographic analytics across customer country, city, and shipping destination
- channel performance analysis across web, mobile, and store transactions
- behavioral analytics using event streams for product interaction, session activity, and device usage
- funnel analytics across key user journey stages such as page view, add to cart, checkout start, and purchase
- time-series analysis for trends, seasonality, and demand patterns

---

# Project Structure


```
shopstream-analytics-pipeline
│
├── pipeline
│   ├── dataset_script.py
│   ├── load_data.py
│   └── run_pipeline.py
│
├── database
│   └── schema.sql
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
│
├── dashboard
│
├── notebooks
│   └── exploration.ipynb
│
├── docs
│   └── Case_Study_DS_Intern.pdf
│
├── .env.example
├── requirements.txt
└── README.md
```

---

# Pipeline Components

## 1 Synthetic Data Generator

**File**

```
pipeline/generate_dataset.py
```

Generates realistic synthetic data using:

- Faker
- NumPy
- Pandas

The script outputs CSV files to:

```
data/raw/
```

Generated files:

```
customers.csv
products.csv
orders.csv
order_items.csv
events.csv
```

---

## 2 Database Schema Definition

**File**

```
database/schema.sql
```

Defines all PostgreSQL tables and relationships required to store the datasets.

The schema ensures:

- primary keys
- foreign key constraints
- consistent data types
- analytical query compatibility

---

## 3 ETL Data Loader

**File**

```
pipeline/load_data.py
```

This script performs the **ETL process**.

### Extract
Reads generated CSV files from:

```
data/raw/
```

### Transform

- converts timestamp fields
- normalizes data types
- prepares records for insertion

### Load

Loads records into PostgreSQL using **SQLAlchemy**.

---

## 4 Pipeline Runner

**File**

```
pipeline/run_pipeline.py
```

This script orchestrates the pipeline so that the entire process runs automatically.

Pipeline execution steps:

1. Generate synthetic dataset
2. Load CSV files into PostgreSQL

---

# Environment Setup

Create a virtual environment:

```
python -m venv .venv
```

Activate the environment:

```
.venv\Scripts\activate
```

Install project dependencies:

```
pip install -r requirements.txt
```

---

# Database Setup

Create the PostgreSQL database:

```
CREATE DATABASE shopstream_analytics;
```

Run the schema definition:

```
\i database/schema.sql
```

---

# Running the Data Pipeline

After environment and database setup, run the entire pipeline with a single command:

```
python pipeline/run_pipeline.py
```

This command will automatically:

1. generate synthetic datasets
2. load all datasets into PostgreSQL tables

---

# Verifying the Pipeline

To confirm that the pipeline executed successfully:

```sql
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM order_items;
SELECT COUNT(*) FROM events;
```

Each table should return populated records.

---

# Technologies Used

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

# Key Design Considerations

### Reproducibility

The entire pipeline can be executed using a single command.

### Modularity

Data generation, ETL loading, and orchestration are separated into independent scripts.

### Analytical Schema

The relational schema supports common analytical queries used in e-commerce analytics.

### Scalability

The architecture can be extended to support larger datasets or additional data sources.

---

