import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Crime
from ..security import require_api_token
from ..services.data_service import REQUIRED_COLUMNS, parse_csv, replace_records

router = APIRouter()
UPLOADS: dict[str, dict] = {}
MAX_FILE_SIZE = 25 * 1024 * 1024


@router.get("/upload/config")
def upload_config():
    return {
        "acceptedExtensions": [".csv"],
        "maxFileSizeMb": 25,
        "requiredColumns": REQUIRED_COLUMNS,
        "requiresAuth": bool(os.getenv("API_ADMIN_TOKEN", "").strip()),
    }


@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _token: str = Depends(require_api_token),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=415, detail="Only CSV files are accepted.")
    content = await file.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, detail="File exceeds the 25 MB upload limit."
        )
    records, received, errors = parse_csv(content)
    if not records and received == 0:
        raise HTTPException(
            status_code=422, detail=errors or ["The CSV contains no rows."]
        )

    detected_areas = sorted({record["area"] for record in records})
    if records:
        removed, imported = replace_records(db, records)
    else:
        removed, imported = 0, 0
    rejected = received - len(records)
    messages = []
    if records:
        messages.append(
            f"Replaced {removed} existing records with {imported} valid records."
        )
    else:
        messages.append(
            "No valid records found; the existing dataset was left unchanged."
        )
    if imported:
        messages.append(f"Imported {imported} valid records into the active dataset.")
    if not detected_areas:
        detected_areas = ["Unassigned"]
    analysis_status = "completed" if records else "failed"
    upload_id = f"upl_{uuid.uuid4().hex[:12]}"
    status = {
        "uploadId": upload_id,
        "fileName": os.path.basename(file.filename),
        "stage": "completed",
        "areas": detected_areas,
        "detectedArea": detected_areas[0] if len(detected_areas) == 1 else None,
        "validRecords": len(records),
        "rowsReceived": received,
        "rowsImported": imported,
        "rowsRejected": rejected,
        "analysisStatus": analysis_status,
        "messages": messages,
        "errors": errors[:100],
    }
    UPLOADS[upload_id] = status
    return status


@router.get("/upload/{upload_id}/status")
def upload_status(upload_id: str, _token: str = Depends(require_api_token)):
    status = UPLOADS.get(upload_id)
    if status is None:
        raise HTTPException(status_code=404, detail="Upload not found.")
    return status
