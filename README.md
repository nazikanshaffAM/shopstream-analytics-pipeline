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
- KPI cards, revenue trend, category chart, channel chart, and funnel chart
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

## Step-by-Step Setup

Follow this sequence exactly for a clean local run.

### 1. Prerequisites

Install these tools before cloning or running the project:

- Git
- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL 14+ with `psql` available in your terminal

You will run three local services/tools during setup:

- PostgreSQL database
- Cube API on port 4000
- Vite dashboard on port 5173

### 2. Clone the repository

```bash
git clone <your-repository-url>
cd shopstream-analytics-pipeline
```

### 3. Create the Python virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

macOS or Linux:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 4. Install Node.js dependencies

Install Cube dependencies:

```bash
cd cube
npm install
cd ..
```

Install dashboard dependencies:

```bash
cd dashboard
npm install
cd ..
```

### 5. Create environment files

Create the root `.env` file from `.env.example`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL credentials:

```env
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shopstream_analytics
```

Create the Cube environment file:

Windows PowerShell:

```powershell
Copy-Item cube/.env.example cube/.env
```

macOS or Linux:

```bash
cp cube/.env.example cube/.env
```

Update `cube/.env` and make sure these values are set correctly:

```env
CUBEJS_DEV_MODE=true
CUBEJS_API_SECRET=shopstream_secret_key
CUBEJS_DB_TYPE=postgres
CUBEJS_DB_HOST=localhost
CUBEJS_DB_PORT=5432
CUBEJS_DB_NAME=shopstream_analytics
CUBEJS_DB_USER=postgres
CUBEJS_DB_PASS=your_postgres_password
CUBEJS_SCHEMA_PATH=schema
```

`DB_PASSWORD` in the root `.env` and `CUBEJS_DB_PASS` in `cube/.env` should match the same PostgreSQL password.

### 6. Start PostgreSQL and create the database

Make sure PostgreSQL is running, then create the database:

```bash
psql -U postgres -c "CREATE DATABASE shopstream_analytics;"
```

If the database already exists, PostgreSQL will return an error and you can continue.

### 7. Create tables and analytical views

Run the schema file:

```bash
psql -U postgres -d shopstream_analytics -f database/schema.sql
```

Run the views file:

```bash
psql -U postgres -d shopstream_analytics -f database/views.sql
```

### 8. Generate and load the dataset

With the virtual environment active, run:

```bash
python pipeline/run_pipeline.py
```

What this does:

- Generates synthetic CSV files in `data/raw`
- Truncates existing tables
- Loads the CSV data into PostgreSQL

### 9. Validate that data loaded successfully

Run these checks:

```bash
psql -U postgres -d shopstream_analytics -c "SELECT COUNT(*) FROM customers;"
psql -U postgres -d shopstream_analytics -c "SELECT COUNT(*) FROM products;"
psql -U postgres -d shopstream_analytics -c "SELECT COUNT(*) FROM orders;"
psql -U postgres -d shopstream_analytics -c "SELECT COUNT(*) FROM order_items;"
psql -U postgres -d shopstream_analytics -c "SELECT COUNT(*) FROM events;"
```

You should see non-zero row counts for all five tables.

### 10. Start the Cube semantic layer

Open a new terminal, go to the project root, and run:

```bash
cd cube
npm run dev
```

Then verify Cube is responding:

```text
http://localhost:4000/cubejs-api/v1/meta
```

Expected cubes:

- Customers
- Products
- Orders
- Events
- FactSales

### 11. Start the dashboard

Open another new terminal and run:

```bash
cd dashboard
npm start
```

Open the dashboard in your browser:

```text
http://localhost:5173
```

### 12. Confirm the project is running successfully

The project is working correctly when all of these are true:

- PostgreSQL is running and contains loaded data
- Cube responds at `http://localhost:4000/cubejs-api/v1/meta`
- The dashboard opens at `http://localhost:5173`
- KPI cards and charts display data instead of zeros or blanks

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
│       │   ├── ChannelChart.jsx
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

The full local setup sequence is documented in Step-by-Step Setup above.

---

## Run Task 1 (Pipeline)

1. Create the database.
2. Apply `database/schema.sql`.
3. Run `python pipeline/run_pipeline.py`.
4. Validate that all five tables have non-zero row counts.

---

## Run Task 2 (Semantic Layer)

1. Apply `database/views.sql`.
2. Create `cube/.env` from `cube/.env.example`.
3. Keep `CUBEJS_SCHEMA_PATH=schema`.
4. Run `cd cube` and `npm run dev`.
5. Verify `http://localhost:4000/cubejs-api/v1/meta`.

---

## Run Task 3 (Dashboard UI)

1. Install dashboard dependencies with `cd dashboard` and `npm install`.
2. Start the dashboard with `npm start`.
3. Keep Cube running in a separate terminal.
4. Open `http://localhost:5173`.

---

## Full Local Run Order

1. Clone the repository.
2. Create and activate the Python virtual environment.
3. Install Python and Node.js dependencies.
4. Create `.env` and `cube/.env` from their example files.
5. Start PostgreSQL and create `shopstream_analytics`.
6. Apply `database/schema.sql` and `database/views.sql`.
7. Run `python pipeline/run_pipeline.py`.
8. Start Cube with `cd cube && npm run dev`.
9. Start the dashboard with `cd dashboard && npm start`.
10. Open `http://localhost:5173` and verify charts render.

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

---

## Troubleshooting

### Dashboard shows zero or blank charts

1. Confirm Cube API is running at http://localhost:4000/cubejs-api/v1/meta.
2. Make sure SQL views are applied: database/views.sql.
3. In the dashboard, set Date Range to All time if the current window has no data.
4. Verify tables contain rows after pipeline load (orders, order_items, events).
5. Confirm `CUBEJS_API_SECRET` in `cube/.env` matches the token used in `dashboard/src/services/cubeApi.js`.

