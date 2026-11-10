"""
Grad-CAM (Gradient-weighted Class Activation Mapping) for Medical Image Explainability.

Mathematical Formulation:
1. Feature map forward pass: A^k in R^{U x V} at target layer (e.g. denseblock4.denselayer16.conv2).
2. Gradient backward pass: d(y^c) / d(A_{i,j}^k) for target class c.
3. Importance weights: alpha_k^c = (1 / Z) * sum_i sum_j (d y^c / d A_{i,j}^k)  [Global Average Pooling of Gradients]
4. Class Activation Map: L^c_{Grad-CAM} = ReLU( sum_k alpha_k^c * A^k )
   ReLU is applied because we are exclusively interested in features that positively contribute
   to the predicted pathological class, while negative contributions correspond to other classes.
"""
import numpy as np
import cv2
import torch
import torch.nn.functional as F

class GradCAM:
    """
    Hook-based PyTorch Grad-CAM extractor for DenseNet, EfficientNet, or ResNet architectures.
    """
    def __init__(self, model: torch.nn.Module, target_layer: torch.nn.Module):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self.handles = []
        self._register_hooks()

    def _register_hooks(self):
        def forward_hook(module, input, output):
            self.activations = output.detach()

        def backward_hook(module, grad_in, grad_out):
            # grad_out[0] contains the gradient d(loss)/d(output)
            self.gradients = grad_out[0].detach()

        self.handles.append(self.target_layer.register_forward_hook(forward_hook))
        self.handles.append(self.target_layer.register_full_backward_hook(backward_hook))

    def generate_heatmap(self, input_tensor: torch.Tensor, class_idx: int = None) -> np.ndarray:
        """
        Generate a 2D normalized Grad-CAM heatmap for the specified class index.
        Args:
            input_tensor: (1, C, H, W) normalized tensor
            class_idx: int, index of target class (if None, argmax of output)
        Returns:
            np.ndarray of shape (H, W) in range [0.0, 1.0]
        """
        self.model.eval()
        self.model.zero_grad()

        # Forward pass
        output = self.model(input_tensor)
        if class_idx is None:
            class_idx = torch.argmax(output, dim=1).item()

        # Backward pass on the scalar score for class_idx
        target_score = output[0, class_idx]
        target_score.backward(retain_graph=True)

        # Gradient shape: (1, K, u, v); Activations shape: (1, K, u, v)
        gradients = self.gradients[0]  # (K, u, v)
        activations = self.activations[0]  # (K, u, v)

        # Global average pooling of gradients over spatial dimensions (u, v) -> weights alpha_k
        weights = torch.mean(gradients, dim=(1, 2))  # shape: (K,)

        # Weighted combination of activation maps
        cam = torch.zeros(activations.shape[1:], dtype=torch.float32, device=activations.device)
        for k, w in enumerate(weights):
            cam += w * activations[k]

        # Apply ReLU to retain only positive contributions to class c
        cam = F.relu(cam)

        # Normalize between 0 and 1
        cam = cam.cpu().numpy()
        cam_min, cam_max = np.min(cam), np.max(cam)
        if cam_max - cam_min > 1e-8:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = np.zeros_like(cam)

        # Upsample to input image dimensions (H, W) using bilinear interpolation
        _, _, H, W = input_tensor.shape
        heatmap_resized = cv2.resize(cam, (W, H), interpolation=cv2.INTER_LINEAR)
        return heatmap_resized

    def overlay_heatmap(
        self,
        original_image: np.ndarray,
        heatmap: np.ndarray,
        alpha: float = 0.5,
        colormap: int = cv2.COLORMAP_JET
    ) -> np.ndarray:
        """
        Blend original grayscale or RGB image with colorized heatmap.
        Args:
            original_image: (H, W, 3) uint8 [0, 255]
            heatmap: (H, W) float [0.0, 1.0]
            alpha: float transparency overlay factor [0.0, 1.0]
            colormap: OpenCV colormap constant
        Returns:
            (H, W, 3) uint8 blended RGB image
        """
        heatmap_uint8 = np.uint8(255 * heatmap)
        color_heatmap = cv2.applyColorMap(heatmap_uint8, colormap)
        # OpenCV uses BGR by default, convert colormap to RGB
        color_heatmap_rgb = cv2.cvtColor(color_heatmap, cv2.COLOR_BGR2RGB)

        blended = cv2.addWeighted(original_image, 1.0 - alpha, color_heatmap_rgb, alpha, 0)
        return blended

    def remove_hooks(self):
        for handle in self.handles:
            handle.remove()
