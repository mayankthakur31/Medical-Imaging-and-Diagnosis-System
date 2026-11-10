"""
Pydantic V2 validation schemas for REST API endpoints.
"""
from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class ImageUploadResponse(BaseModel):
    image_id: str
    study_id: str
    accession_number: str
    patient_pseudonym: str
    file_format: str
    width: Optional[int] = None
    height: Optional[int] = None
    dicom_metadata: Optional[Dict[str, Any]] = None
    uploaded_at: datetime

class ClassProbability(BaseModel):
    class_name: str
    probability: float

class AIPredictionResponse(BaseModel):
    prediction_id: str
    image_id: str
    model_name: str
    model_version: str
    predicted_class: str
    confidence_score: float
    uncertainty_score: float
    class_probabilities: Dict[str, float]
    heatmap_url: Optional[str] = None
    inference_time_ms: float
    created_at: datetime
    disclaimer: str = (
        "Educational and research use only. Not for primary clinical diagnostic decision making. "
        "Predictions require independent review by a qualified radiologist."
    )

class ReviewDecisionCreate(BaseModel):
    reviewer_id: str = Field(..., description="UUID of the physician/reviewer")
    status: str = Field(..., pattern="^(APPROVED|REJECTED|OVERREAD_REQUESTED|BOARD_REVIEW)$")
    clinical_notes: Optional[str] = Field(None, max_length=2000)
    radiologist_agreement: bool = True

class ReviewDecisionResponse(BaseModel):
    id: str
    image_id: str
    reviewer_id: str
    reviewer_name: Optional[str] = None
    status: str
    clinical_notes: Optional[str] = None
    radiologist_agreement: bool
    created_at: datetime

class AuditLogEntryResponse(BaseModel):
    id: str
    image_id: Optional[str] = None
    user_id: Optional[str] = None
    action_type: str
    previous_state: Optional[Dict[str, Any]] = None
    new_state: Optional[Dict[str, Any]] = None
    tamper_proof_hash: str
    timestamp: datetime

class OrthancStudySummary(BaseModel):
    orthanc_id: str
    patient_id: str
    patient_name: str
    accession_number: str
    study_date: str
    modality: str
    series_count: int
    instances_count: int
