"""
Load the four backend CSV files into a SQLite database under backend/db/.
Run from backend directory: python -m scripts.csv_to_sqlite
"""
import csv
import re
import sqlite3
from pathlib import Path

# Paths relative to backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent
DB_DIR = BACKEND_DIR / "core" / "db_connection"
DB_PATH = DB_DIR / "connectivity.db"

# CSV file path, table name, 0-based header row index, 0-based first data row index
CSV_CONFIG = [
    (
        BACKEND_DIR / "Margin.csv",
        "margin",
        0,  # header: Sl.No., State, Region, ...
        3,  # data starts at Row 3 (Row 2 is empty)
    ),
    (
        BACKEND_DIR / "Transformation Capacity.csv",
        "transformation_capacity",
        1,  # header: ,S.No., Region, State, Substation...
        3,  # data starts at Row 3 (Row 2 is empty)
    ),
    (
        BACKEND_DIR / "Data to be captured.csv",
        "data_to_be_captured",
        1,  # Header at Row 1
        4,  # Data starts at Row 4
    ),
    (
        BACKEND_DIR / "Element Status.csv",
        "element_status",
        0,  # Header at Row 0
        3,  # Data starts at Row 3
    ),
]


def sanitize_column_name(name: str, seen: set) -> str:
    """Make a valid SQLite column name: alphanumeric + underscore only; ensure unique."""
    if not name or not str(name).strip():
        name = "unnamed"
    s = re.sub(r"[^\w]", "_", str(name).strip())
    s = re.sub(r"_+", "_", s).strip("_").lower() or "unnamed"
    if len(s) > 64:
        s = s[:64]
    base = s
    idx = 0
    while s in seen:
        idx += 1
        s = f"{base}_{idx}"
    seen.add(s)
    return s


def read_csv_rows(filepath: Path) -> list:
    """Read all CSV rows. Tries utf-8, then cp1252, then latin-1 with replacement."""
    for encoding in ("utf-8", "cp1252", "latin-1"):
        try:
            with open(filepath, "r", encoding=encoding, newline="") as f:
                return list(csv.reader(f, quoting=csv.QUOTE_MINIMAL))
        except UnicodeDecodeError:
            continue
    with open(filepath, "r", encoding="latin-1", errors="replace", newline="") as f:
        return list(csv.reader(f, quoting=csv.QUOTE_MINIMAL))


def load_csv_into_table(
    conn: sqlite3.Connection,
    filepath: Path,
    table_name: str,
    header_row_index: int,
    data_start_index: int,
) -> int:
    """Load one CSV into a table. Returns number of rows inserted."""
    rows = read_csv_rows(filepath)
    if not rows:
        return 0

    # Get header and data
    header_row = rows[header_row_index]
    data_rows = rows[data_start_index:]

    # Strip leftmost column if it's empty in the discovered header row
    # (Matches cleaning logic in reports.py for scanned Excel/CSV exports)
    if header_row and not str(header_row[0]).strip():
        header_row = header_row[1:]
        data_rows = [r[1:] if len(r) > 1 else r for r in data_rows]

    seen = set()
    col_names = []
    for i, cell in enumerate(header_row):
        name = sanitize_column_name(cell or f"col_{i}", seen)
        col_names.append(name)

    # Ensure we have enough columns for all data rows (some rows may have more columns)
    max_cols = max(len(r) for r in data_rows) if data_rows else len(col_names)
    while len(col_names) < max_cols:
        seen.add(f"col_{len(col_names)}")
        col_names.append(f"col_{len(col_names)}")

    # Create table (all TEXT for simplicity)
    columns_ddl = ", ".join(f'"{c}" TEXT' for c in col_names)
    conn.execute(f'DROP TABLE IF EXISTS "{table_name}"')
    conn.execute(f'CREATE TABLE "{table_name}" ({columns_ddl})')

    # Insert rows
    placeholders = ", ".join("?" for _ in col_names)
    col_list = ", ".join(f'"{c}"' for c in col_names)
    insert_sql = f'INSERT INTO "{table_name}" ({col_list}) VALUES ({placeholders})'
    count = 0
    for row in data_rows:
        # Pad or trim row to match column count
        padded = (row + [""] * max_cols)[:max_cols]
        try:
            conn.execute(insert_sql, padded)
            count += 1
        except Exception as e:
            # Skip rows that cause errors (e.g. encoding)
            pass
    return count


def main():
    DB_DIR.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    try:
        for filepath, table_name, header_row, data_start in CSV_CONFIG:
            if not filepath.exists():
                print(f"Skip (not found): {filepath}")
                continue
            try:
                n = load_csv_into_table(conn, filepath, table_name, header_row, data_start)
                print(f"Loaded {n} rows into {table_name} from {filepath.name}")
            except Exception as e:
                print(f"Error loading {filepath.name}: {e}")
                raise
        conn.commit()
        print(f"Database written to {DB_PATH}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
