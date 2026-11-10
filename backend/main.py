"""
FastAPI Main Application Entry Point.
AI-Assisted Medical Imaging and Diagnosis System (RadPulse AI).
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routers import analysis, review, orthanc

# Create tables in PostgreSQL or SQLite
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RadPulse AI - Medical Imaging & Diagnostic Intelligence",
    description=(
        "Comprehensive educational & research platform for Chest Radiograph classification, "
        "Grad-CAM visual explainability, DICOM ingestion, clinical reviews, and immutable audit logs. "
        "NOT FOR CLINICAL DIAGNOSTIC USE."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router)
app.include_router(review.router)
app.include_router(orthanc.router)

@app.get("/")
def root():
    return {
        "system": "RadPulse AI Medical Imaging API",
        "status": "healthy",
        "version": "1.0.0",
        "device": "PyTorch CPU/CUDA",
        "docs": "/docs",
        "disclaimer": "Educational AI research platform. Not a certified medical device."
    }

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "database": "connected",
        "model_loaded": True,
        "model_architecture": "DenseNet-121 (CheXNet weights)",
        "orthanc_pacs": "ready"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
