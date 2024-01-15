from . import utils
from .classes import Frame
from .inference import inference


def get_merge(frame: Frame):
    comp_image, mask_image = utils.parse(frame)
    return utils.image2url(comp_image)


def get_mask(frame: Frame):
    comp_image, mask_image = utils.parse(frame)
    return utils.image2url(mask_image)


def get_harmony(frame: Frame):
    comp_image, mask_image = utils.parse(frame)

    pred_image = inference(comp_image, mask_image)
    return utils.image2url(pred_image)
