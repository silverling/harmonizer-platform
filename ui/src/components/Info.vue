<template>
  <div id="info" class="flex flex-col">
    <hr class="py-1" />
    <div class="flex justify-between py-1">
      <span>鼠标左键</span>
      <span>平移模型</span>
    </div>
    <div class="flex justify-between py-1">
      <span>鼠标中键</span>
      <span>旋转模型</span>
    </div>
    <div class="flex justify-between py-1">
      <span>鼠标滚轮（模型）</span>
      <span>缩放模型</span>
    </div>
    <div class="flex justify-between py-1">
      <span>鼠标滚轮（背景）</span>
      <span>缩放视图</span>
    </div>
    <div class="flex justify-between py-1">
      <span>鼠标右键</span>
      <span>平移视图</span>
    </div>
    <div class="flex justify-between py-1">
      <span>Tips: 调整光线参数时，可以使用鼠标滚轮来精细地调整</span>
    </div>
  </div>
</template>

<script setup></script>
<style>
#info {
  font-size: 11px;
  color: white;
  background-color: #1f1f1f;
  padding: 5px;
}
</style>
