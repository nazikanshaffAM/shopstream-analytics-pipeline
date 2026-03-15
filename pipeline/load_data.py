import os
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "shopstream_analytics")

DATA_DIR = os.path.join("data", "raw")

engine = create_engine(
    f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

file_table_map = [
    ("customers.csv", "customers"),
    ("products.csv", "products"),
    ("orders.csv", "orders"),
    ("order_items.csv", "order_items"),
    ("events.csv", "events"),
]

def main():
    print("Starting CSV load process...")

    with engine.connect() as conn:
        for file_name, table_name in file_table_map:
            file_path = os.path.join(DATA_DIR, file_name)

            if not os.path.exists(file_path):
                print(f"File not found: {file_path}")
                continue

            print(f"Loading {file_name} into {table_name}...")
            df = pd.read_csv(file_path)

            if table_name == "customers":
                df["signup_date"] = pd.to_datetime(df["signup_date"], errors="coerce").dt.date

            if table_name == "orders":
                df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")

            if table_name == "events":
                df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")

            conn.execute(text(f"TRUNCATE TABLE {table_name} CASCADE"))
            conn.commit()

            df.to_sql(table_name, engine, if_exists="append", index=False)
            print(f"Loaded {len(df)} rows into {table_name}")

    print("All CSV files loaded successfully.")

if __name__ == "__main__":
    main()
