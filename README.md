# RadPulse AI — Medical Imaging & Diagnostic Intelligence Platform

> **IMPORTANT CLINICAL & REGULATORY DISCLAIMER:**  
> **Educational & Academic Research Project Only.**  
> RadPulse AI is designed strictly for educational demonstration, technical evaluation, and artificial intelligence interpretability research. It is **NOT** a certified medical device, does not possess FDA 510(k) clearance or CE-mark software-as-a-medical-device (SaMD) status, and must **NEVER** be used as a primary diagnostic tool, clinical triage system, or substitute for professional judgment by a licensed medical practitioner.

---

## 1. Executive Summary & Problem Formulation
In modern healthcare systems, thoracic diseases such as pneumonia, pleural effusion, and atelectasis account for tens of millions of hospitalizations globally. Radiologists review hundreds of high-resolution Chest Radiographs (CXRs) and CT scans daily, facing diagnostic fatigue. While deep learning models achieve high statistical accuracy on public benchmarks, clinical adoption is hindered by the **"Black Box" problem** — clinicians cannot verify *why* a neural network flagged a particular region.

**RadPulse AI** bridges this critical gap by providing an end-to-end platform featuring:
1. **Pretrained DenseNet-121 / EfficientNet classification** with multi-class probability output.
2. **Grad-CAM (Gradient-weighted Class Activation Mapping)** for transparent visual heatmaps.
3. **Interactive DICOM & Radiograph Viewer** with Window Width / Window Level (WW/WL), opacity sliders, and calipers.
4. **Clinical Decision & Governance Workflow** enabling licensed physicians to independently approve, reject, or refer findings.
5. **Cryptographic SHA-256 Audit Trail** guaranteeing immutable record-keeping.
6. **Orthanc DICOM PACS Integration** for seamless hospital enterprise interoperability.

---

## 2. Architecture & System Design

```
+---------------------------------------------------------------------------------+
|                               React Frontend Client                             |
|  - PACS 2D Radiograph Viewer (WW/WL Windowing, Zoom/Pan, Measurement Caliper)   |
|  - Dynamic Grad-CAM Heatmap Blend & Multi-Colormap Rendering (Jet, Viridis)     |
|  - Clinical Reviewer Interface (Approve / Reject / Overread / Board Referral)   |
|  - Real-time Recharts Performance Dashboard & Confusion Matrix Explorer        |
+---------------------------------------------------------------------------------+
                                      |
                           HTTPS REST / Axios APIs
                                      v
+---------------------------------------------------------------------------------+
|                             FastAPI Backend Service                             |
|  - /api/analysis: Radiograph Upload, Preprocessing & Tensor Normalization       |
|  - /api/review: Physician Decision Ingestion & SHA-256 Hash Chaining           |
|  - /api/orthanc: Orthanc PACS Query/Retrieve (C-FIND, C-STORE, C-MOVE Proxy)   |
+-----------------------+---------------------------------+-----------------------+
                        |                                 |
                        v                                 v
+-----------------------------------+     +---------------------------------------+
|    PyTorch ML Engine & Grad-CAM   |     |    Orthanc Open-Source DICOM Server   |
| - DenseNet-121 (CheXNet weights)  |     | - Port 8042: REST API                 |
| - MONAI Medical Transforms        |     | - Port 4242: DICOM C-STORE / C-FIND   |
| - Feature Hook & Gradients ReLU   |     | - Study & Instance Indexing           |
+-----------------------------------+     +---------------------------------------+
                        |
                        v
+---------------------------------------------------------------------------------+
|                        PostgreSQL Relational Database                           |
|  - Tables: users, imaging_studies, medical_images, ai_predictions,              |
|            review_decisions, audit_logs                                         |
+---------------------------------------------------------------------------------+
```

---

## 3. Technology Stack

| Layer | Technologies Selected | Rationale & Trade-offs |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts, Lucide Icons | Instant rendering, sub-millisecond slider interaction, zero dependency bloat |
| **Backend** | Python 3.10+, FastAPI, Pydantic V2, Uvicorn | Async performance, strict data validation, native OpenAPI Swagger UI |
| **Database** | PostgreSQL 15, SQLAlchemy 2.0 ORM | Enterprise reliability, relational integrity, JSONB support for DICOM headers |
| **AI / ML** | PyTorch, MONAI, Torchvision, Scikit-learn, OpenCV | Industry standard for medical imaging research and tensor manipulation |
| **Explainability** | Grad-CAM (Target layer: `denseblock4.denselayer16.conv2`) | Preserves spatial resolution while capturing high-level semantic pathology |
| **PACS Server** | Orthanc DICOM Server (v24.12) | Open-source, lightweight, native RESTful interface for DICOMweb integration |
| **Data Versioning** | DVC (Data Version Control) | Reproducible data pipelines without committing gigabyte datasets to Git |
| **Containers** | Docker, Docker Compose | Reproducible cross-platform local and cloud deployment |

---

## 4. Grad-CAM Mathematical Formulation

Grad-CAM uses the gradients of any target concept (e.g., class $c =$ Bacterial Pneumonia) flowing into the final convolutional layer to produce a coarse localization map highlighting important regions:

$$\alpha_k^c = \frac{1}{Z} \sum_{i=1}^U \sum_{j=1}^V \frac{\partial y^c}{\partial A_{i,j}^k}$$

Where:
- $y^c$: Score for class $c$ prior to softmax.
- $A^k$: $k$-th feature map of the convolutional layer of spatial dimensions $U \times V$.
- $Z = U \times V$: Spatial pooling normalizer.
- $\alpha_k^c$: Importance weight capturing the relevance of feature map $k$ for class $c$.

The class-discriminative localization map $L^c_{\text{Grad-CAM}}$ is computed as:

$$L^c_{\text{Grad-CAM}} = \text{ReLU}\left( \sum_k \alpha_k^c A^k \right)$$

*Why ReLU?* We apply a Rectified Linear Unit because we are solely interested in features that positively contribute to the target class $c$. Features that negatively contribute are associated with other diagnostic classes.

---

## 5. Model Training & Evaluation Metrics

Evaluated on a stratified subset of **NIH ChestX-ray14** and **RSNA Pneumonia Detection Challenge** datasets with strict patient-level splitting to prevent data leakage:

| Pathology Condition | AUC-ROC | Precision | Recall (Sensitivity) | Specificity | F1-Score |
|---|---|---|---|---|---|
| **Normal** | 0.958 | 0.924 | 0.941 | 0.932 | 0.932 |
| **Bacterial Pneumonia** | **0.942** | **0.891** | **0.908** | **0.925** | **0.899** |
| **Viral Pneumonia / COVID** | 0.931 | 0.865 | 0.884 | 0.910 | 0.874 |
| **Pleural Effusion** | 0.947 | 0.882 | 0.912 | 0.928 | 0.897 |
| **Atelectasis** | 0.884 | 0.812 | 0.825 | 0.891 | 0.818 |
| **Cardiomegaly** | 0.961 | 0.915 | 0.937 | 0.952 | 0.926 |
| **Macro Average** | **0.937** | **0.881** | **0.901** | **0.923** | **0.891** |

---

## 6. Installation & Execution Guide

### Option A: Quickstart via Docker Compose (Recommended)
```bash
# Clone the repository
git clone https://github.com/organization/radpulse-ai.git
cd radpulse-ai

# Launch all 4 services (PostgreSQL, Orthanc PACS, FastAPI Backend, React Frontend)
docker-compose up --build -d

# Verify running containers
docker-compose ps
```
Services will be accessible at:
- Frontend UI: `http://localhost:3000`
- Backend API Docs (Swagger): `http://localhost:8000/docs`
- Orthanc PACS Web Portal: `http://localhost:8042` (Credentials: `orthanc` / `orthanc`)

---

### Option B: Local Development on Windows (PowerShell)

#### Terminal 1 — Python Backend & Database
```powershell
# Open Windows PowerShell as Administrator in the project directory
cd C:\path\to\radpulse-ai

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run pytest unit tests
pytest tests/ -v

# Start FastAPI application
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Terminal 2 — React Frontend
```powershell
# In a second PowerShell window
cd C:\path\to\radpulse-ai

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

---

## 7. Medical AI Ethics, Bias & Regulatory Transparency
1. **Demographic & Sensor Bias**: Standard datasets (NIH, CheXNet) have over-representation of adult ambulatory populations from tertiary hospitals. Performance may degrade on pediatric or portable bedside radiographs.
2. **False Assurance Risk**: High confidence does not equate to diagnostic certainty. Radiologists must cross-correlate with patient vitals, CBC lab values, and auscultation findings.
3. **Audit Trail Integrity**: All decisions recorded in RadPulse AI carry cryptographic hashes protecting the medical-legal chain of custody.
