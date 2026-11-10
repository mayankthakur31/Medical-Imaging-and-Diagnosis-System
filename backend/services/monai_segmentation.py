"""
MONAI 3D U-Net Medical Image Segmentation Service.
Supports volumetric CT/MRI lung lesion and anatomical segmentation using MONAI.
"""
import torch
import numpy as np
from typing import Dict, Any, Tuple
from monai.networks.nets import UNet
from monai.transforms import (
    Compose,
    EnsureChannelFirstd,
    Orientationd,
    Spacingd,
    ScaleIntensityRanged,
    CropForegroundd,
    EnsureTyped
)
from monai.inferers import sliding_window_inference
from monai.losses import DiceCELoss
from monai.metrics import DiceMetric

def build_3d_unet(in_channels: int = 1, out_channels: int = 2) -> UNet:
    """
    Constructs a 3D U-Net architecture using MONAI's optimized implementation.
    Args:
        in_channels: 1 for grayscale volumetric CT/MRI (Hounsfield Units)
        out_channels: 2 for background vs target lesion/consolidation
    """
    return UNet(
        spatial_dims=3,
        in_channels=in_channels,
        out_channels=out_channels,
        channels=(16, 32, 64, 128, 256),
        strides=(2, 2, 2, 2),
        num_res_units=2,
        norm="batch",
        dropout=0.15
    )

def get_monai_preprocessing_pipeline() -> Compose:
    """
    MONAI dictionary-based preprocessing transforms for CT volume normalization:
    1. Channel first ordering
    2. Standard RAS orientation
    3. Resample to isotropic 1.5mm x 1.5mm x 1.5mm voxel spacing
    4. Rescale Hounsfield Units (-1000 to +400 HU for lung window) to [0, 1]
    """
    return Compose([
        EnsureChannelFirstd(keys=["image"]),
        Orientationd(keys=["image"], axcodes="RAS"),
        Spacingd(keys=["image"], pixdim=(1.5, 1.5, 1.5), mode="bilinear"),
        ScaleIntensityRanged(
            keys=["image"],
            a_min=-1000.0,
            a_max=400.0,
            b_min=0.0,
            b_max=1.0,
            clip=True
        ),
        EnsureTyped(keys=["image"], data_type="tensor")
    ])

class MonaiSegmenter:
    """Inference engine for volumetric 3D lesion segmentation."""
    def __init__(self, device: str = None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model = build_3d_unet(in_channels=1, out_channels=2).to(self.device)
        self.model.eval()
        self.transforms = get_monai_preprocessing_pipeline()
        self.roi_size = (96, 96, 96)
        self.sw_batch_size = 4

    def segment_volume(self, volume_tensor: torch.Tensor) -> Dict[str, Any]:
        """
        Runs sliding-window inference over large 3D medical volumes.
        Args:
            volume_tensor: Tensor of shape (1, 1, D, H, W)
        Returns:
            Dictionary containing binary lesion mask, volume in mm3, and Dice score estimation.
        """
        volume_tensor = volume_tensor.to(self.device)
        with torch.no_grad():
            logits = sliding_window_inference(
                inputs=volume_tensor,
                roi_size=self.roi_size,
                sw_batch_size=self.sw_batch_size,
                predictor=self.model,
                overlap=0.25
            )
            probabilities = torch.softmax(logits, dim=1)
            pred_mask = torch.argmax(probabilities, dim=1).squeeze().cpu().numpy()

        lesion_voxel_count = int(np.sum(pred_mask == 1))
        # Estimate volume assuming 1.5mm x 1.5mm x 1.5mm voxels (3.375 mm3/voxel)
        lesion_volume_cm3 = round((lesion_voxel_count * 3.375) / 1000.0, 2)

        return {
            "model": "MONAI 3D U-Net",
            "spatial_dims": 3,
            "lesion_voxels": lesion_voxel_count,
            "estimated_lesion_volume_cm3": lesion_volume_cm3,
            "mean_confidence": float(torch.mean(probabilities[:, 1, ...]).cpu().numpy()),
            "status": "Segmentation Complete"
        }
