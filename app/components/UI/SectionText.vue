<script setup lang="ts">
import { ref } from 'vue';
import { useTextReveal } from '~/composables/useTextReveal';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  type: {
    type: String,
    required: false,
    default: ''
  }
});

const boldTextRef = ref<HTMLElement | null>(null);

useTextReveal(boldTextRef, () => props.data.bold_text);
</script>

<template>
  <div class="textContent" :class="type">
    <h2 v-if="props.data.headline">{{ props.data.headline }}</h2>
    <p v-if="props.data.bold_text && type!='secondary'" ref="boldTextRef" class="bold_text">
      {{ props.data.bold_text }}
    </p>
    <p v-else  class="bold_text">
      {{ props.data.bold_text }}

    </p>
    <div class="mask-container" v-if="typeof props.data.secondary_text === 'string'">
      <p class="secondary_text one_time_animation cubic_fade"
         v-observe-visibility
         data-offset="30"

      >
        {{ props.data.secondary_text }}
      </p>
    </div>

    <div v-else-if="Array.isArray(props.data.secondary_text)" class="mask-container split">
      <p class="secondary_text one_time_animation cubic_fade" v-for="(el, index) in props.data.secondary_text" :key="index"
         v-observe-visibility
         data-offset="30"
      >
        {{ el }}
      </p>
    </div>
  </div>
</template>

<style scoped>
:deep(.line-wrapper) {
  display: block;
}

.textContent {
  display: flex;
  flex-direction: column;
  gap: 3.2rem;
}

.bold_text {
  font-size: 5.6rem;
  font-weight: bold;
  font-kerning: none;
  color: inherit;
  line-height: 1.1;
}

h2{
  text-transform: uppercase;
}
.secondary_text {
  font-size: 1.4rem;
  font-weight: bold;
}
.textContent > .secondary_text {
  width: 70%;
}
.textContent > div {
  display: flex;
  gap: 4rem;
}
.textContent > .split p {
  width: 50%;
}
@media screen and (max-width: 1200px) {
  .bold_text {
    font-size: 3.2rem;
  }
}

@media screen and (max-width: 760px) {
  .textContent > .split{
    flex-direction: column;
    gap: 1rem;
  }
  .textContent > .split p {
    width: 100%;
  }
}

@media screen and (max-width: 600px) {
  .textContent{
    gap: 2rem;
  }
  .textContent > .secondary_text{
    width: 100%;
  }
}
@media screen and (max-width: 500px) {
  .bold_text {
    font-size: 2rem;
  }
  .textContent > div {
    gap: 2rem;
  }
}
</style>