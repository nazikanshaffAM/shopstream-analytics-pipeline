import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def run(script_name):
    script_path = BASE_DIR / script_name
    result = subprocess.run([sys.executable, str(script_path)])
    if result.returncode != 0:
        raise SystemExit(f"Failed while running {script_name}")

if __name__ == "__main__":
    print("Generating dataset...")
    run("dataset_script.py")
    print("Loading data into PostgreSQL...")
    run("load_data.py")
    print("All pipeline steps completed successfully.")
