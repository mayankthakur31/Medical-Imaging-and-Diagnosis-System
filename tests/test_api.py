"""
Pytest integration tests for FastAPI Endpoints, DICOM Ingestion, and Audit Trails.
"""
import io
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    """Verify system health and status reporting."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["model_loaded"] is True
    assert "DenseNet" in data["model_architecture"]

def test_orthanc_status_endpoint():
    """Verify Orthanc PACS proxy status endpoint."""
    response = client.get("/api/orthanc/status")
    assert response.status_code == 200
    data = response.json()
    assert "dicom_aet" in data

def test_orthanc_studies_list():
    """Verify retrieved studies list formatting."""
    response = client.get("/api/orthanc/studies")
    assert response.status_code == 200
    studies = response.json()
    assert isinstance(studies, list)
    if len(studies) > 0:
        assert "patient_id" in studies[0]
        assert "accession_number" in studies[0]

def test_image_upload_validation_invalid_format():
    """Ensure invalid file formats (e.g. TXT, EXE) are rejected with HTTP 400."""
    fake_file = io.BytesIO(b"not a valid image")
    response = client.post(
        "/api/analysis/upload",
        files={"file": ("malicious_payload.exe", fake_file, "application/octet-stream")}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]

def test_doctor_review_decision_and_audit():
    """Verify clinical review workflow and cryptographic audit logging."""
    payload = {
        "reviewer_id": "usr-rad-01",
        "status": "APPROVED",
        "clinical_notes": "Consistent with right middle lobe airspace opacity. Clinical correlation recommended.",
        "radiologist_agreement": True
    }
    response = client.post("/api/review/test-img-001/decide", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "APPROVED"
    assert res_data["reviewer_id"] == "usr-rad-01"

    # Query audit logs
    audit_resp = client.get("/api/review/audit-logs")
    assert audit_resp.status_code == 200
    logs = audit_resp.json()
    assert len(logs) > 0
    assert "tamper_proof_hash" in logs[0]
