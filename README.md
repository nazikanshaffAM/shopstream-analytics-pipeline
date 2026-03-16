# ShopStream Analytics Pipeline

An end-to-end data engineering and analytics foundation for a simulated e-commerce platform.
The project generates synthetic operational and behavioral data, loads it into PostgreSQL, builds analytical views, and exposes a semantic layer through Cube for downstream dashboarding.

---

## Current Status

### Task 1: Data Pipeline (Completed)

- Synthetic dataset generation
- PostgreSQL schema design
- Automated CSV-to-PostgreSQL loading
- One-command pipeline runner

### Task 2: Semantic Layer (Completed)

- Analytical SQL views created in PostgreSQL
- Cube semantic models configured and running
- Primary-key and schema-path issues resolved
- Metadata endpoint loading successfully

### Task 3: Dashboard UI (Completed)

- React + Vite analytics dashboard connected to Cube API
- KPI cards, revenue trend, category chart, and funnel chart
- Responsive UI with custom visual styling

---

## Architecture

```
Synthetic Data Generator (Python)
↓
CSV Dataset Files
↓
ETL Loader Pipeline
↓
PostgreSQL Tables
↓
Analytical SQL Views
↓
Semantic Layer (Cube)
↓
Dashboard/BI Consumption
```

---

## Project Structure

```
shopstream-analytics-pipeline/
├── pipeline/
│   ├── dataset_script.py
│   ├── load_data.py
│   └── run_pipeline.py
│
├── database/
│   ├── schema.sql
│   └── views.sql
│
├── data/
│   └── raw/
│       ├── customers.csv
│       ├── products.csv
│       ├── orders.csv
│       ├── order_items.csv
│       └── events.csv
│
├── cube/
│   ├── cube.js
│   ├── .env.example
│   ├── package.json
│   ├── schema/                # Active semantic models
│   │   ├── Customers.js
│   │   ├── Products.js
│   │   ├── Orders.js
│   │   ├── Events.js
│   │   └── FactSales.js
│   └── model/cubes/           # Auto-generated models (not active)
│
├── dashboard/
│   ├── package.json
│   └── src/
│       ├── pages/
│       │   └── Dashboard.jsx
│       ├── components/
│       │   ├── KPIcards.jsx
│       │   ├── RevenueChart.jsx
│       │   ├── CategoryChart.jsx
│       │   └── FunnelChart.jsx
│       ├── services/
│       │   └── cubeApi.js
│       └── styles/
│           └── dashboard.css
├── notebooks/
│   └── exploration.ipynb
├── docs/
│   └── Case_Study_DS_Intern.pdf
├── .env.example
├── requirements.txt
└── README.md
```

---

## Datasets

| Dataset | Description |
|------|------|
| customers | Customer demographic and account data |
| products | Product catalog, pricing, and stock |
| orders | Order-level transactional data |
| order_items | Item-level purchase detail |
| events | Behavioral clickstream/activity events |

---

## Database Layer

### Base Tables

- customers
- products
- orders
- order_items
- events

### Key Relationships

- orders.customer_id -> customers.customer_id
- order_items.order_id -> orders.order_id
- order_items.product_id -> products.product_id

### Analytical Views (database/views.sql)

- fact_sales
- customer_metrics
- product_metrics
- daily_sales_summary
- channel_performance
- event_funnel_summary

---

## Pipeline Components

### 1) Dataset Generation

File: pipeline/dataset_script.py

- Generates realistic synthetic data with Faker, NumPy, and Pandas
- Writes CSV files to data/raw/

### 2) ETL Loader

File: pipeline/load_data.py

- Reads CSV files
- Applies datetime/date parsing where required
- Truncates target tables and reloads data
- Loads into PostgreSQL via SQLAlchemy

### 3) Pipeline Orchestration

File: pipeline/run_pipeline.py

- Runs dataset generation
- Runs ETL loading
- Exits on failure if any step fails

---

## Environment Setup

### Python Environment

```bash
python -m venv .venv
```

```powershell
.venv\Scripts\activate
```

```bash
pip install -r requirements.txt
```

### Root Environment Variables

Create .env in project root (or copy from .env.example):

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shopstream_analytics
```

---

## Run Task 1 (Pipeline)

### 1) Create database

```sql
CREATE DATABASE shopstream_analytics;
```

### 2) Create tables

```sql
\i database/schema.sql
```

### 3) Run pipeline

```bash
python pipeline/run_pipeline.py
```

### 4) Validate row counts

```sql
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM order_items;
SELECT COUNT(*) FROM events;
```

---

## Run Task 2 (Semantic Layer)

### 1) Create analytical views

```sql
\i database/views.sql
```

### 2) Configure Cube

From cube/.env.example, set your DB values in cube/.env and keep:

```env
CUBEJS_SCHEMA_PATH=schema
```

This ensures Cube loads manual models from cube/schema.

### 3) Install Cube dependencies

```bash
cd cube
npm install
```

### 4) Start Cube server

```bash
npm run dev
```

### 5) Verify metadata endpoint

```text
http://localhost:4000/cubejs-api/v1/meta
```

Expected cubes from manual schema:

- Customers
- Products
- Orders
- Events
- FactSales

---

## Run Task 3 (Dashboard UI)

### 1) Install dashboard dependencies

```bash
cd dashboard
npm install
```

### 2) Start dashboard

```bash
npm start
```

Vite will run locally (usually at http://localhost:5173).

### 3) Make sure Cube API is running

In a separate terminal:

```bash
cd cube
npm run dev
```

The dashboard expects Cube metadata and query endpoints to be available.

---

## Full Local Run Order

1. Start PostgreSQL and ensure `shopstream_analytics` exists
2. Apply `database/schema.sql` and `database/views.sql`
3. Run `python pipeline/run_pipeline.py` (optional refresh of synthetic data)
4. Start Cube API with `cd cube && npm run dev`
5. Start Dashboard UI with `cd dashboard && npm start`

---

## Tech Stack

- Python
- Pandas
- NumPy
- Faker
- SQLAlchemy
- PostgreSQL
- Cube.js

---

## Notes

- cube/model/cubes contains generated lowercase models and is currently kept for reference.
- Active semantic models are in cube/schema and are loaded via CUBEJS_SCHEMA_PATH=schema.
- Dashboard UI uses React + Vite and reads analytics data from Cube.

