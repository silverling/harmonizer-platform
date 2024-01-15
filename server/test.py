from PIL import Image
from io import BytesIO
from base64 import b64decode
from classes import Frame
import pickle
import numpy as np
import cv2
from copy import deepcopy


with open("frame.pkl", "rb") as f:
    frame = pickle.load(f)


def process(frame: Frame):
    konva = frame.konva
    three = frame.three

    url2image(konva.data).save("konva.png")
    konva_image = np.asarray(url2image(konva.data))

    three_image = np.asarray(url2image(three.data))
    Image.fromarray(three_image).convert("RGBA").save("three.png")

    """get the alpha channel"""
    alpha = three_image[:, :, 3:]
    three_image = three_image[:, :, :3]
    Image.fromarray(alpha.squeeze(-1)).convert("L").save(
        "alpha.jpg", subsampling=0, quality=100
    )

    print("given konva:", konva.origin, konva.scale)
    print("given three:", three.origin, three.scale)

    print("konva image shape:", konva_image.shape)
    print("three image shape:", three_image.shape)

    konva_height_original, konva_width_original = konva_image.shape[:2]
    three_height_original, three_width_original = three_image.shape[:2]

    konva_height_rendered = konva_height_original * konva.scale
    konva_width_rendered = konva_width_original * konva.scale
    three_height_rendered = three_height_original * three.scale
    three_width_rendered = three_width_original * three.scale

    relative_scale = konva.scale / three.scale
    konva_height_scaled = konva_height_original * relative_scale
    konva_width_scaled = konva_width_original * relative_scale
    three_height_scaled = three_height_original
    three_width_scaled = three_width_original

    konva_image_scaled = cv2.resize(
        konva_image, (int(konva_width_scaled), int(konva_height_scaled))
    )
    three_image_scaled = three_image

    print("relative scale:", relative_scale)
    print("konva image resize to:", konva_image_scaled.shape)

    """box: (left, top, right, bottom)"""
    konva_rendered = (
        konva.origin.x,
        konva.origin.y,
        konva.origin.x + konva_width_rendered,
        konva.origin.y + konva_height_rendered,
    )

    three_rendered = (
        three.origin.x - three_width_rendered / 2,
        three.origin.y - three_height_rendered / 2,
        three.origin.x + three_width_rendered / 2,
        three.origin.y + three_height_rendered / 2,
    )

    overlap_rendered = (
        max(konva_rendered[0], three_rendered[0]),
        max(konva_rendered[1], three_rendered[1]),
        min(konva_rendered[2], three_rendered[2]),
        min(konva_rendered[3], three_rendered[3]),
    )

    konva_overlap_ratio = (
        (overlap_rendered[0] - konva_rendered[0]) / konva_width_rendered,
        (overlap_rendered[1] - konva_rendered[1]) / konva_height_rendered,
        (overlap_rendered[2] - konva_rendered[0]) / konva_width_rendered,
        (overlap_rendered[3] - konva_rendered[1]) / konva_height_rendered,
    )

    three_overlap_ratio = (
        (overlap_rendered[0] - three_rendered[0]) / three_width_rendered,
        (overlap_rendered[1] - three_rendered[1]) / three_height_rendered,
        (overlap_rendered[2] - three_rendered[0]) / three_width_rendered,
        (overlap_rendered[3] - three_rendered[1]) / three_height_rendered,
    )

    konva_overlap_scaled = (
        round(konva_width_scaled * konva_overlap_ratio[0]),
        round(konva_height_scaled * konva_overlap_ratio[1]),
        round(konva_width_scaled * konva_overlap_ratio[2]),
        round(konva_height_scaled * konva_overlap_ratio[3]),
    )

    three_overlap_scaled = (
        round(three_width_scaled * three_overlap_ratio[0]),
        round(three_height_scaled * three_overlap_ratio[1]),
        round(three_width_scaled * three_overlap_ratio[2]),
        round(three_height_scaled * three_overlap_ratio[3]),
    )

    # print("konva renderer:", konva_rendered)
    # print("three renderer:", three_rendered)
    # print("overlap renderer:", overlap_rendered)
    # print("ovrelap ratio konva:", konva_overlap_ratio)
    # print("ovrelap ratio three:", three_overlap_ratio)
    # print("ovrelap scaled konva:", konva_overlap_scaled)
    # print("ovrelap scaled three:", three_overlap_scaled)

    konva_patch = get_patch(konva_image_scaled, konva_overlap_scaled)
    three_patch = get_patch(three_image_scaled, three_overlap_scaled)
    alpha_patch = get_patch(alpha, three_overlap_scaled) / 255

    comp_image_scaled = deepcopy(konva_image_scaled)
    mask_image_scaled = np.zeros((*konva_image_scaled.shape[:2], 1), dtype=np.uint8)

    comp_patch = get_patch(comp_image_scaled, konva_overlap_scaled)
    mask_patch = get_patch(mask_image_scaled, konva_overlap_scaled)

    comp_patch[:, :, :] = konva_patch * (1 - alpha_patch) + three_patch * alpha_patch
    mask_patch[:, :, :] = get_patch(alpha, three_overlap_scaled)

    konva_shape_original = (konva_width_original, konva_height_original)
    comp_image = resize(comp_image_scaled, konva_shape_original)
    mask_image = np.bool8(cv2.resize(mask_image_scaled, konva_shape_original))
    mask_image = extend_contour(mask_image, size=2)
    bg_mask = mask_image == 0
    comp_image[bg_mask] = konva_image[bg_mask]

    print(mask_image.shape)

    Image.fromarray(comp_image).convert("RGB").save(
        "merge.jpg", subsampling=0, quality=100
    )
    Image.fromarray(mask_image).convert("L").save(
        "mask.jpg", subsampling=0, quality=100
    )


def url2image(dataUrl):
    _, data = dataUrl.split("base64,", 1)
    return Image.open(BytesIO(b64decode(data)))


def get_patch(image, region):
    return image[region[1] : region[3], region[0] : region[2]]


def extend_contour(image, size=5):
    image = np.uint8(np.bool8(image)) * 255
    contours, hierarchy = cv2.findContours(
        image, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE
    )
    contours = sorted(contours, key=lambda c: len(c), reverse=True)
    cv2.drawContours(image, contours, 0, (255, 255, 255), size)
    return image


def harmonize(comp_image):
    pass


def resize(image, size):
    print(image.shape[:2][::-1])
    print(size)
    print(image.shape[0] / size[1])
    scale = round(image.shape[0] / size[1])
    ksize = scale
    if ksize % 2 == 0:
        ksize += 1
    print(ksize)
    image = cv2.GaussianBlur(image, (ksize, ksize), 0)
    return cv2.resize(image, size, interpolation=cv2.INTER_AREA)
    # return np.array(Image.fromarray(image).resize(size, Image.Resampling.LANCZOS))


process(frame)
