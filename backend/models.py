"""
SQLAlchemy ORM Models for Medical Imaging, AI Predictions, Doctor Reviews, and Immutable Audit Logs.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="reviewer")  # "admin", "reviewer", "radiologist"
    department = Column(String(100), default="Radiology & Thoracic Imaging")
    created_at = Column(DateTime, default=datetime.utcnow)

    reviews = relationship("ReviewDecision", back_populates="reviewer")
    audit_logs = relationship("AuditLog", back_populates="actor")


class ImagingStudy(Base):
    __tablename__ = "imaging_studies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    accession_number = Column(String(64), unique=True, index=True, nullable=False)
    patient_pseudonym = Column(String(100), nullable=False)
    modality = Column(String(16), nullable=False)  # "DX", "CR", "CT", "MR"
    body_part = Column(String(64), default="CHEST")
    study_date = Column(DateTime, default=datetime.utcnow)
    orthanc_study_id = Column(String(128), nullable=True)
    institution_name = Column(String(128), default="Academic Medical Center")
    created_at = Column(DateTime, default=datetime.utcnow)

    images = relationship("MedicalImage", back_populates="study", cascade="all, delete-orphan")


class MedicalImage(Base):
    __tablename__ = "medical_images"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    study_id = Column(String(36), ForeignKey("imaging_studies.id"), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_format = Column(String(16), nullable=False)  # "PNG", "JPEG", "DICOM"
    sop_instance_uid = Column(String(128), nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    dicom_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    study = relationship("ImagingStudy", back_populates="images")
    predictions = relationship("AIPrediction", back_populates="image", cascade="all, delete-orphan")
    reviews = relationship("ReviewDecision", back_populates="image", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="image", cascade="all, delete-orphan")


class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    image_id = Column(String(36), ForeignKey("medical_images.id"), nullable=False)
    model_name = Column(String(64), default="DenseNet121-CheXNet-Weights")
    model_version = Column(String(32), default="v1.4.2")
    predicted_class = Column(String(64), nullable=False)  # "Normal", "Bacterial Pneumonia", "Viral Pneumonia", etc.
    confidence_score = Column(Float, nullable=False)
    class_probabilities = Column(JSON, nullable=False)  # dict of class: prob
    uncertainty_score = Column(Float, default=0.08)  # Shannon entropy / MC Dropout
    heatmap_path = Column(String(512), nullable=True)
    inference_time_ms = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    image = relationship("MedicalImage", back_populates="predictions")


class ReviewDecision(Base):
    __tablename__ = "review_decisions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    image_id = Column(String(36), ForeignKey("medical_images.id"), nullable=False)
    reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(String(32), nullable=False)  # "APPROVED", "REJECTED", "OVERREAD_REQUESTED", "BOARD_REVIEW"
    clinical_notes = Column(Text, nullable=True)
    radiologist_agreement = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    image = relationship("MedicalImage", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    image_id = Column(String(36), ForeignKey("medical_images.id"), nullable=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action_type = Column(String(64), nullable=False)  # "REVIEW_APPROVED", "REVIEW_REJECTED", "IMAGE_UPLOAD", "INFERENCE_RUN"
    previous_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
    tamper_proof_hash = Column(String(128), nullable=False)
    ip_address = Column(String(64), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    image = relationship("MedicalImage", back_populates="audit_logs")
    actor = relationship("User", back_populates="audit_logs")
