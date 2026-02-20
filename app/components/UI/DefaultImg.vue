<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  src: string
  alt?: string
}>()

const altText = computed(() => props.alt || 'image')

</script>

<template>
  <picture class="default-img">

    <source
        media="(min-width: 768px)"
        type="image/webp"
        :srcset="`/images/${src}-desktop.webp`"
    />
    <source
        media="(min-width: 768px)"
        type="image/avif"
        :srcset="`/images/${src}-desktop.avif`"
    />
    <source
        media="(min-width: 768px)"
        type="image/png"
        :srcset="`/images/${src}-desktop.png`"
    />

    <source
        media="(max-width: 767px)"
        type="image/webp"
        :srcset="`/images/${src}-mobile.webp`"
    />
    <source
        media="(max-width: 767px)"
        type="image/avif"
        :srcset="`/images/${src}-mobile.avif`"
    />
    <source
        media="(max-width: 767px)"
        type="image/png"
        :srcset="`/images/${src}-mobile.png`"
    />
    <img
        :src="`/images/${src}-desktop.webp`"
        :alt="altText"
        class="default-img__img"
    />
  </picture>
</template>

<style scoped>
.default-img {
  display: block;
  width: 100%;
  height: 100%;
}
.default-img.dark{
  position: relative;
}
.default-img.dark::after{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  content: '';
  border-radius: inherit;
}
.default-img.absolute{
  position: absolute;
  left: 0;
  top: 0;
}
.default-img__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: inherit;
}
</style>
