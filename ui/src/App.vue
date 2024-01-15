<template>
  <Welcome v-if="showWelcome" />
  <Viewport />
</template>

<script setup lang="ts">
import { ref } from "vue";
import Welcome from "./components/Welcome.vue";
import Viewport from "./components/Viewport.vue";
import emitter from "./modules/emitter";

let showWelcome = ref(true);
emitter.on("konvaReady", _ => (showWelcome.value = false));
emitter.on("threeReady", _ => (showWelcome.value = false));
</script>
