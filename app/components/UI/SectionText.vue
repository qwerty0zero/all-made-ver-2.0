<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(SplitText, ScrollTrigger);

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
});

const boldTextRef = ref<HTMLElement | null>(null);
let splitInstance: SplitText | null = null;
let animContext: gsap.Context | null = null;
let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
let lastWidth = 0;

const animateText = () => {
  if (animContext) animContext.revert();
  if (splitInstance) splitInstance.revert();
  if (!boldTextRef.value) return;

  animContext = gsap.context(() => {
    splitInstance = new SplitText(boldTextRef.value, {
      type: "lines, words, chars",
      linesClass: "line-wrapper",
    });

    gsap.fromTo(splitInstance.chars,
        {
          opacity: 0.1
        },
        {
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "none",

          scrollTrigger: {
            trigger: boldTextRef.value,
            start: "top center+=20%",
            end: "bottom center+=10%",
            scrub: 0.5,
          }
        }
    );
  }, boldTextRef.value);

  ScrollTrigger.refresh();
};

const handleResize = () => {
  const newWidth = window.innerWidth;
  if (newWidth === lastWidth) return;
  lastWidth = newWidth;
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    animateText();
  }, 200);
};

onMounted(() => {
  nextTick(() => {
    lastWidth = window.innerWidth;
    setTimeout(() => {
      if (props.data.bold_text) animateText();
    }, 100);

    window.addEventListener('resize', handleResize);
  });
});

watch(() => props.data.bold_text, () => {
  nextTick(() => animateText());
});

onUnmounted(() => {
  if (animContext) animContext.revert();
  if (resizeTimeout) clearTimeout(resizeTimeout);
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="textContent">
    <h2 v-if="props.data.headline">{{ props.data.headline }}</h2>
    <p v-if="props.data.bold_text" ref="boldTextRef" class="bold_text">
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