"""
Automated unit tests for PyTorch DenseNet-121, MONAI 3D U-Net, and pydicom metadata extraction.
"""
import pytest
import torch
import numpy as np
from backend.services.inference import MedicalModelEngine, CLASSES
from backend.services.monai_segmentation import build_3d_unet
from backend.services.dicom_parser import parse_dicom_bytes

def test_densenet_inference_dimensions():
    """Verify DenseNet forward pass produces normalized probabilities across all 6 classes."""
    engine = MedicalModelEngine(device="cpu")
    dummy_tensor = torch.randn(1, 3, 224, 224)
    predicted_class, confidence, prob_dict, uncertainty, latency_ms = engine.predict(dummy_tensor)

    assert predicted_class in CLASSES
    assert 0.0 <= confidence <= 1.0
    assert len(prob_dict) == len(CLASSES)
    assert 0.0 <= uncertainty <= 1.0
    assert latency_ms > 0

def test_monai_3d_unet_forward():
    """Verify MONAI 3D U-Net accepts 3D tensor (1, 1, 32, 32, 32) and produces 2-channel binary logits."""
    model = build_3d_unet(in_channels=1, out_channels=2)
    model.eval()
    dummy_vol = torch.randn(1, 1, 32, 32, 32)
    with torch.no_grad():
        out = model(dummy_vol)
    assert out.shape == (1, 2, 32, 32, 32)
