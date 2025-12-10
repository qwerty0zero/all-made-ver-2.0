<script setup lang="ts">
import { ref, provide } from 'vue';
import { useRoute } from '#app';
import { getUserLang } from '@/utils/getUserLang';
import Cursor from "~/components/UI/Cursor.vue";

const hasCursor = ref(false);

const route = useRoute();
const availableLangs = ['pl', 'rus', 'eng'];

const lang = ref('pl');
const pathLang = route.path.split('/')[1];

if (availableLangs.includes(pathLang)) {
  lang.value = pathLang;
} else {
  lang.value = getUserLang();
}

async function loadJson(fileName: string) {
  try {
    const data = await import(`@/assets/json/${lang.value}/${fileName}.json`);
    return data.default;
  } catch {
    console.warn(`JSON для языка "${lang.value}" не найден: ${fileName}.json, fallback pl`);
    try {
      const fallbackData = await import(`@/assets/json/pl/${fileName}.json`);
      return fallbackData.default;
    } catch {
      console.error(`Fallback JSON для "${fileName}.json" не найден`);
      return {};
    }
  }
}

onMounted(() => {
  if (!import.meta.client) return
  hasCursor.value = window.matchMedia('(any-pointer: fine)').matches;
})

const headerData = ref(await loadJson('header'));
const footerData = ref(await loadJson('footer'));
const indexData = ref(await loadJson('index'));

provide('lang', lang);
provide('headerData', headerData);
provide('indexData', indexData);
provide('footerData', footerData);


</script>

<template>
  <NuxtPage />
  <Cursor v-if="hasCursor" />

</template>
