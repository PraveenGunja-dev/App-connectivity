import csv
import uuid
import io
import pandas as pd
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response, StreamingResponse

from src.config.config import settings
from src.models.reports import ReportDataResponse
from core.auth.auth import get_current_user_optional
from src.models.auth import UserResponse

router = APIRouter(prefix="/reports", tags=["reports"])

# This file lives at backend/app/routers/reports.py
# backend directory is three levels up from here.
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DB_PATH = BACKEND_DIR / "db" / "connectivity.db"

# Tables created by scripts/csv_to_sqlite.py
REPORT_TABLES: dict[str, str] = {
    "data_to_be_captured": "data_to_be_captured",
    "margin": "margin",
    "element_status": "element_status",
    "transformation_capacity": "transformation_capacity",
}

# Original CSV files (for exact layout rendering)
CSV_FILES: dict[str, Path] = {
    "data_to_be_captured": BACKEND_DIR / "Data to be captured.csv",
    "margin": BACKEND_DIR / "Margin.csv",
    "element_status": BACKEND_DIR / "Element Status.csv",
    "transformation_capacity": BACKEND_DIR
    / "Connectivity_Application_Data_TEST_ALL_SHEETS39 6(Transformation Capacity).csv",
}

DEFAULT_REPORT_TABLE = "data_to_be_captured"


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


def _fetch_report_data_from_db(table_name: str = DEFAULT_REPORT_TABLE) -> list[list[str]]:
    """Read tabular report data from PostgreSQL as a 2D list for the Excel viewer."""
    if table_name not in REPORT_TABLES:
        raise HTTPException(status_code=400, detail=f"Unknown report sheet: {table_name}")

    try:
        import psycopg2
        # Note: psycopg2 needs database_url to be a regular postgres connection string
        # since settings currently has `database_url` for sqlite, we'll build it from parts:
        conn = psycopg2.connect(
            host=settings.db_host,
            database=settings.db_name,
            user=settings.db_user,
            password=settings.db_password,
            port=settings.db_port
        )
        try:
            cursor = conn.cursor()
            cursor.execute(f'SELECT * FROM "{REPORT_TABLES[table_name]}"')
            rows = cursor.fetchall()
            headers = [col.name for col in cursor.description] if cursor.description else []
        finally:
            conn.close()
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error reading report data from database: {exc}",
        ) from exc

    if not headers:
        raise HTTPException(status_code=404, detail="No report columns found in database.")

    data: list[list[str]] = [list(map(str, headers))]
    for row in rows:
        data.append(["" if value is None else str(value) for value in row])

    if len(data) == 1:
        raise HTTPException(status_code=404, detail="No report rows found in database.")

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


def _get_processed_csv_rows(sheet: str) -> list[list[str]]:
    """Helper to read and clean CSV data for both viewer and download."""
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
        if not row: return False
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
