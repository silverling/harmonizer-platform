<template>
  <div class="absolute right-2 top-2 z-30 w-60">
    <div id="lil_gui"></div>
    <Info />
  </div>
  <div id="viewportEl">
    <canvas id="threeEl" class="absolute left-0 top-0 z-20"></canvas>
    <div id="konvaEl" class="absolute left-0 top-0 z-10"></div>
  </div>
  <input type="file" accept="image/*" class="hidden" id="uploadImageButton" @change="uploadImage" />
  <input type="file" accept=".glb, .gltf" class="hidden" id="uploadModelButton" @change="uploadModel" />
</template>

<script setup>
import { onMounted, ref } from "vue";
import Info from "./Info.vue";
import Scene from "../modules/scene";
import Stage from "../modules/stage";
import Viewport from "../modules/viewport";
import emitter from "../modules/emitter";
import { uploadImage, uploadModel } from "../modules/utils";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

onMounted(() => {
  const threeLayer = new Scene(threeEl);
  const konvaLayer = new Stage(konvaEl);
  const viewport = new Viewport(viewportEl, threeLayer, konvaLayer);
  const gui = new GUI({ container: lil_gui, width: 240, title: "操作台" });

  gui.add(uploadImageButton, "click").name("上传背景");
  gui.add(uploadModelButton, "click").name("上传模型");
  gui.add(viewport, "exportMerge").name("导出合成图片");
  gui.add(viewport, "exportMask").name("导出掩码图片");
  gui.add(viewport, "exportHarmony").name("导出和谐图片");
  gui.add(threeLayer.params, "enableLight").name("启用光照");
  console.log(threeLayer.params.enableLight);
  gui.add(threeLayer.params, "angleY", 0, 360, 0.01).name("光线角度");
  gui.add(threeLayer.params, "angleZ", 20, 90, 0.005).name("光线高度");
  gui.add(threeLayer.params, "opacity", 0.1, 0.9, 0.00005).name("光线强度");
  gui.add(threeLayer.params, "rotateX", -35, 35, 0.005).name("模型 X 轴旋转角");
  gui.add(threeLayer.params, "rotateZ", -35, 35, 0.005).name("模型 Z 轴旋转角");

  emitter.on("uploadImage", file => konvaLayer.setImage(file));
  emitter.on("uploadModel", file => threeLayer.setModel(file));
});
</script>
