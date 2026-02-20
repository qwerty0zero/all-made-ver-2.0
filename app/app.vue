<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue';
import Cursor from "~/components/UI/Cursor.vue";
import DefaultHeader from "~/components/UI/DefaultHeader.vue";
import DefaultFooter from "~/components/UI/DefaultFooter.vue";

const hasCursor = ref(false);
onMounted(() => {
  if (!import.meta.client) return
  hasCursor.value = window.matchMedia('(any-pointer: fine)').matches;
})
</script>

<template>
  <DefaultHeader/>
  <NuxtPage />
  <DefaultFooter/>
  <Cursor v-if="hasCursor" />
</template>