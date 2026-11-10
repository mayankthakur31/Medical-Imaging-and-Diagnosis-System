"""
Unit tests for Grad-CAM Mathematical Invariants and Heatmap Normalization.
"""
import torch
import torch.nn as nn
import numpy as np
from backend.services.gradcam import GradCAM

class SimpleConvNet(nn.Module):
    """Toy architecture for deterministic testing of Grad-CAM hooks."""
    def __init__(self):
        super().__init__()
        self.conv = nn.Conv2d(3, 8, kernel_size=3, padding=1)
        self.relu = nn.ReLU()
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc = nn.Linear(8, 2)

    def forward(self, x):
        x = self.relu(self.conv(x))
        x = self.pool(x)
        x = torch.flatten(x, 1)
        return self.fc(x)

def test_gradcam_dimensions_and_normalization():
    """Verify heatmap matches input spatial dimensions and lies strictly in [0, 1]."""
    model = SimpleConvNet()
    cam_engine = GradCAM(model, target_layer=model.conv)

    # Input tensor shape (1, 3, 64, 64)
    dummy_input = torch.randn(1, 3, 64, 64)
    heatmap = cam_engine.generate_heatmap(dummy_input, class_idx=0)

    assert heatmap.shape == (64, 64), f"Expected (64, 64), got {heatmap.shape}"
    assert np.min(heatmap) >= 0.0, "Heatmap minimum must be >= 0.0"
    assert np.max(heatmap) <= 1.0, "Heatmap maximum must be <= 1.0"

    cam_engine.remove_hooks()
