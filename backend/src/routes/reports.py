import csv
import uuid
import io
import pandas as pd
from functools import lru_cache
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response, StreamingResponse

from src.config.config import settings
from src.models.reports import ReportDataResponse
from core.auth.auth import get_current_user_optional
from src.models.auth import UserResponse

router = APIRouter(prefix="/reports", tags=["reports"])

# Paths relative to backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DB_PATH = BACKEND_DIR / "core" / "db_connection" / "connectivity.db"

# Tables created by scripts/csv_to_sqlite.py
REPORT_TABLES: dict[str, str] = {
    "margin": "margin",
    "transformation_capacity": "transformation_capacity",
    "data_to_be_captured": "data_to_be_captured",
    "element_status": "element_status",
}

# Original CSV files (contain the full data set for each sheet)
CSV_FILES: dict[str, Path] = {
    "margin": BACKEND_DIR / "Margin.csv",
    "transformation_capacity": BACKEND_DIR / "Transformation Capacity.csv",
    "data_to_be_captured": BACKEND_DIR / "Data to be captured.csv",
    "element_status": BACKEND_DIR / "Element Status.csv",
}

# No specialized header files currently exist for these new CSVs
HEADER_FILES: dict[str, Path] = {}

DEFAULT_REPORT_TABLE = "margin"


def _read_csv_raw(sheet: str) -> list[list[str]]:
    """
    Read the original CSV for a sheet and return all rows exactly as in the file.

    This preserves column order, names, and any multi-row headers or grouped labels.
    """
    path = CSV_FILES.get(sheet)
    if path is None:
        raise HTTPException(status_code=400, detail=f"Unknown report sheet: {sheet}")
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Source CSV for sheet '{sheet}' not found on server.",
        )

    for encoding in ("utf-8", "cp1252", "latin-1"):
        try:
            with open(path, "r", encoding=encoding, newline="") as f:
                return list(csv.reader(f))
        except UnicodeDecodeError:
            continue

    # Fallback with replacement for any undecodable characters
    with open(path, "r", encoding="latin-1", errors="replace", newline="") as f:
        return list(csv.reader(f))


def _read_header_rows(sheet: str) -> list[list[str]]:
    """
    Read the finalized header definition CSV for a sheet.

    These files contain only header / subheader rows and no data. We return the
    non-empty rows exactly as authored so that the grid headers match the
    Excel specification.
    """
    path = HEADER_FILES.get(sheet)
    if path is None or not path.exists():
        return []

    rows: list[list[str]] = []
    for encoding in ("utf-8", "cp1252", "latin-1"):
        try:
            with open(path, "r", encoding=encoding, newline="") as f:
                rows = list(csv.reader(f))
            break
        except UnicodeDecodeError:
            continue

    if not rows:
        return []

    # Keep only rows that have at least one non-blank cell
    non_empty = [row for row in rows if any(str(c).strip() for c in row)]
    return non_empty


def _fetch_report_data_from_db(table_name: str = DEFAULT_REPORT_TABLE) -> list[list[str]]:
    """Read tabular report data from SQLite as a 2D list for the Excel viewer."""
    if table_name not in REPORT_TABLES:
        raise HTTPException(status_code=400, detail=f"Unknown report sheet: {table_name}")

    if not DB_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Database file not found at {DB_PATH}. Please run conversion script.",
        )

    try:
        import sqlite3
        conn = sqlite3.connect(DB_PATH)
        try:
            cursor = conn.cursor()
            cursor.execute(f'SELECT * FROM "{REPORT_TABLES[table_name]}"')
            rows = cursor.fetchall()
            headers = [col[0] for col in cursor.description] if cursor.description else []
        finally:
            conn.close()
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error reading report data from SQLite: {exc}",
        ) from exc

    if not headers:
        raise HTTPException(status_code=404, detail="No report columns found in database.")

    data: list[list[str]] = [list(map(str, headers))]
    for row in rows:
        data.append(["" if value is None else str(value) for value in row])

    return data


@router.get("/data", response_model=ReportDataResponse)
def get_report_data(
    sheet: str = DEFAULT_REPORT_TABLE,
    _user: Annotated[UserResponse | None, Depends(get_current_user_optional)] = None,
) -> ReportDataResponse:
    """Return report grid data for the Excel viewer, backed by SQLite.

    Query param:
    - sheet: one of data_to_be_captured, margin, element_status, transformation_capacity
    """
    data = _fetch_report_data_from_db(sheet)
    return ReportDataResponse(data=data)


@router.post("/upload")
def upload_pdf(
    file: Annotated[UploadFile, File()],
    _user: Annotated[UserResponse | None, Depends(get_current_user_optional)] = None,
) -> dict:
    """Upload a PDF file. Returns file id and filename."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    # Limit size
    content = file.file.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.max_upload_mb} MB",
        )
    upload_path = Path(settings.upload_dir)
    upload_path.mkdir(parents=True, exist_ok=True)
    file_id = str(uuid.uuid4())
    safe_name = f"{file_id}_{file.filename}"
    dest = upload_path / safe_name
    dest.write_bytes(content)
    return {"id": file_id, "filename": file.filename, "saved_as": safe_name}


def _get_base_csv_rows(sheet: str) -> list[list[str]]:
    """Legacy CSV cleaning logic used to derive rows from the original files."""
    rows = _read_csv_raw(sheet)
    if not rows:
        return []

    # 1. Find the primary header row (containing "Sr.no." or "S.No.")
    # This addresses the request to ignore rows above the header in sheets like 'data_to_be_captured'.
    header_idx = -1
    for i, row in enumerate(rows[:10]):  # Only search first 10 rows for efficiency
        # Check first 3 columns for s.no or sr.no (ignoring punctuation/spaces)
        combined = "".join(str(c) for c in row[:3]).lower().replace(" ", "").replace(".", "").replace(",", "")
        if "srno" in combined or "sno" in combined:
            header_idx = i
            break

    if header_idx != -1:
        rows = rows[header_idx:]
    else:
        # Fallback for sheets without Sr.no (like Margin), keep current simple empty row skip
        if len(rows) > 0 and not any(str(c).strip() for c in rows[0]):
            rows = rows[1:]

    # 2. Filter out metadata rows (like "Data Scoure...") that typically appear
    # after the headers but before or during the data.
    def is_junk_metadata(row):
        if not row:
            return False
        # Check first 3 cells for "source" or "scoure" junk
        val = "".join(str(c) for c in row[:3]).lower().strip()
        if "source" in val or "scoure" in val:
            return True
        return False

    # Filter rows, but preserve the first 2 potential header rows
    if len(rows) > 2:
        header_rows = rows[:2]
        data_rows = [r for r in rows[2:] if not is_junk_metadata(r)]
        rows = header_rows + data_rows

    # 3. Stripping the leftmost column if it's empty in the discovered header row.
    # This handles the frequent leading comma in scanned Excel/CSV exports.
    if rows and len(rows[0]) > 0 and not str(rows[0][0]).strip():
        rows = [row[1:] if len(row) > 1 else row for row in rows]

    return rows


# Define which rows from the CSV serve as rich headers (Parent and Child)
# Format: { sheet: (parent_row_idx, child_row_idx) }
RICH_HEADERS_MAP: dict[str, tuple[int, int]] = {
    "margin": (0, 1),
    "transformation_capacity": (1, 2),
    "data_to_be_captured": (1, 2),
    "element_status": (0, 1),
}

# @lru_cache(maxsize=32)
def _get_processed_csv_rows(sheet: str) -> list[list[str]]:
    """
    Helper to read and clean report data for viewer and download.
    Provides two-level headers (Parent and Child) exactly as in the Excel/CSV files.
    """
    raw_csv = _read_csv_raw(sheet)
    if not raw_csv:
        return []

    # 1. Fetch data from DB (actual records)
    try:
        db_data = _fetch_report_data_from_db(sheet)
        # db_data[0] is technical headers from SQLite, we discard it for the rich ones below
        data_rows = db_data[1:] if len(db_data) > 1 else []
    except Exception:
        # Fallback to local CSV if DB fails
        base_rows = _get_base_csv_rows(sheet)
        data_rows = base_rows[2:] if len(base_rows) > 2 else []

    # 2. Extract Rich Headers
    if sheet in RICH_HEADERS_MAP:
        p_idx, c_idx = RICH_HEADERS_MAP[sheet]
        parent_headers = raw_csv[p_idx] if p_idx < len(raw_csv) else []
        child_headers = raw_csv[c_idx] if c_idx < len(raw_csv) else []
    else:
        parent_headers = raw_csv[0] if raw_csv else []
        child_headers = [""] * len(parent_headers)

    # Clean up empty leading column for all files (align with stripped DB columns)
    is_leading_empty = (
        parent_headers and not str(parent_headers[0]).strip() and 
        child_headers and not str(child_headers[0]).strip()
    )
    if is_leading_empty:
         parent_headers = parent_headers[1:]
         child_headers = child_headers[1:]
         # Note: data_rows from DB is already stripped in csv_to_sqlite.py

    # 3. Handle specific column removals for data_to_be_captured
    if sheet == "data_to_be_captured":
        cols_to_remove = {
            "date of last element unique code",
            "in-principle grant",
            "final grant",
            "in case of land bg conversion date"
        }
        
        # Propagate parent headers so we don't lose the label if the first column is removed
        full_parents = []
        last_p = ""
        for p in parent_headers:
            if str(p).strip():
                last_p = p
            full_parents.append(last_p)

        # Identify indices to keep
        remaining_indices = []
        for i in range(len(child_headers)):
            # Normalize strings: replace newlines/tabs with space, then collapse multiple spaces
            def normalize_header(s):
                if not s: return ""
                cleaned = " ".join(str(s).replace("\r", " ").replace("\n", " ").split())
                return cleaned.lower()

            p_val = normalize_header(parent_headers[i])
            c_val = normalize_header(child_headers[i])
            
            if p_val in cols_to_remove or c_val in cols_to_remove:
                continue # Skip this column
            
            remaining_indices.append(i)
        
        # Filter all row sets
        new_parents = [full_parents[i] for i in remaining_indices]
        child_headers = [child_headers[i] for i in remaining_indices]
        data_rows = [[r[i] if i < len(r) else "" for i in remaining_indices] for r in data_rows]

        # Reset parent headers to clear duplicates (restore span structure for UI)
        parent_headers = []
        last_val = None
        for p in new_parents:
            if p == last_val:
                parent_headers.append("")
            else:
                parent_headers.append(p)
                last_val = p if str(p).strip() else None

    # 4. Handle Metadata (As of...) for Transformation Capacity
    meta_row = None
    if sheet == "transformation_capacity":
        if raw_csv and any(str(c).strip() for c in raw_csv[0]):
            meta_row = raw_csv[0]
            if meta_row and not str(meta_row[0]).strip():
                meta_row = meta_row[1:]

    # 4. Standard normalization/padding
    all_rows = [parent_headers, child_headers] + data_rows
    target_len = max(len(r) for r in all_rows) if all_rows else 0

    def normalize_row(row: list[str]) -> list[str]:
        if len(row) < target_len:
            return row + [""] * (target_len - len(row))
        if len(row) > target_len:
            return row[:target_len]
        return row

    normalized = [normalize_row(r) for r in all_rows]
    if meta_row:
        normalized.insert(0, normalize_row(meta_row))
    
    return normalized


@router.get("/download/csv")
def download_report_csv(
    sheet: str = DEFAULT_REPORT_TABLE,
    _user: Annotated[UserResponse | None, Depends(get_current_user_optional)] = None,
) -> Response:
    """Download cleaned report data as CSV."""
    rows = _get_processed_csv_rows(sheet)
    content = "\n".join(",".join(row) for row in rows)
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={sheet}_report.csv"},
    )


@router.get("/download/xlsx")
def download_report_xlsx(
    sheet: str = DEFAULT_REPORT_TABLE,
    _user: Annotated[UserResponse | None, Depends(get_current_user_optional)] = None,
) -> StreamingResponse:
    """Download cleaned report data as XLSX."""
    rows = _get_processed_csv_rows(sheet)
    if not rows:
        raise HTTPException(status_code=404, detail="No data available for export")

    # Use pandas to generate the XLSX file
    df = pd.DataFrame(rows)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, header=False, sheet_name='Report')
    
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={sheet}_report.xlsx"}
    )


@router.get("/csv-raw", response_model=ReportDataResponse)
def get_report_csv_raw(
    sheet: str = DEFAULT_REPORT_TABLE,
    _user: Annotated[UserResponse | None, Depends(get_current_user_optional)] = None,
) -> ReportDataResponse:
    """Return the original CSV content for a sheet as a cleaned 2D array."""
    rows = _get_processed_csv_rows(sheet)
    return ReportDataResponse(data=rows)
