from pydantic import BaseModel


class ReportDataResponse(BaseModel):
    """Full report data: headers + rows (2D array for Excel viewer)."""

    data: list[list[str]]
