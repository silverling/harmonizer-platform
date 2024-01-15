import torch
import torchvision.transforms.functional as F
import numpy as np
from PIL import Image
from os.path import dirname, join

from .model import Harmonizer

weights_path = join(dirname(__file__), "./pretrained/harmonizer.pth")

harmonizer = Harmonizer().cuda()
harmonizer.load_state_dict(torch.load(weights_path), strict=True)
harmonizer.eval()


def inference(comp, mask):
    _comp = F.to_tensor(comp)[None, ...].cuda()
    _mask = F.to_tensor(mask)[None, ...].cuda()

    with torch.no_grad():
        arguments = harmonizer.predict_arguments(_comp, _mask)
        _harmonized = harmonizer.restore_image(_comp, _mask, arguments)[-1]

    _harmonized = _harmonized.squeeze(0).permute(1, 2, 0).cpu().numpy()
    _harmonized = np.uint8(_harmonized * 255)
    return Image.fromarray(_harmonized, mode="RGB")
