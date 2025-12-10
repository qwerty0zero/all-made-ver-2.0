<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const props = defineProps({
  data: {
    type: Array as () => Array<{ title: string; description: string }>,
    required: true,
    default: () => []
  }
});

const sectionRef = ref<HTMLElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);

let ctx: gsap.Context | null = null;

const getScrollAmount = () => {
  if (!wrapperRef.value) return 0;
  const wrapperWidth = wrapperRef.value.scrollWidth;
  return -(wrapperWidth - window.innerWidth + 200);
};

onMounted(() => {
  nextTick(() => {
    document.fonts.ready.then(() => {
      if (!sectionRef.value || !wrapperRef.value) return;

      ctx = gsap.context(() => {

        const tween = gsap.to(wrapperRef.value, {
          x: () => getScrollAmount(),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.value,
            start: "top top",
            end: () => `+=${Math.abs(getScrollAmount())}`,
            toggleClass: "is-pinned",
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          }
        });

        gsap.to("#moving-object", {
          motionPath: {
            path: "#track-path",
            align: "#track-path",
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
            start: 0,
            end: 1,
          },
          transformOrigin: "50% 50%",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.value,
            start: "top top",
            end: () => `+=${Math.abs(getScrollAmount())}`,
            scrub: 1,
            invalidateOnRefresh: true
          }
        });



      }, sectionRef.value);
    });
  });
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});

const formatIndex = (i: number) => {
  return String(i + 1).padStart(2, '0');
};
</script>

<template>
  <section class="timeline-section" ref="sectionRef">
    <div class="timeline-wrapper" ref="wrapperRef">

      <div class="svg-container">
        <svg
            class="curve-svg"
            viewBox="0 0 4200 400"
            preserveAspectRatio="none"
            fill="none"
        >
          <path
              id="track-path"
              d="M 0 200 Q 250 50 500 200 T 1000 200 T 1500 200 T 2000 200 T 2500 200 T 3000 200 T 3500 200 T 4000 200 L 4200 200"
              stroke="#AE9675"
              stroke-width="4"
              fill="none"
              vector-effect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div id="moving-object">
        <img src="/favicon_dark.svg" alt="icon">
      </div>

      <div class="stage-card" v-for="(step, i) in props.data" :key="i">
        <div class="step-index">{{ formatIndex(i) }}</div>

        <h3>{{ step.title || 'Заголовок' }}</h3>
        <p>{{ step.description || 'Описание этапа...' }}</p>
      </div>

    </div>
  </section>
</template>

<style scoped>
.timeline-section {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background-color: var(--color-background-light);
}
.timeline-section::after{
  content: "";
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: var(--color-background-light);
  z-index: -1;
  transition: 0.5s;
}
.timeline-section.is-pinned::after{
  background-color: white ;

}

.is-pinned {
}
.timeline-wrapper {
  display: flex;
  gap: 15vw;
  padding-left: 10vw;
  padding-right: 60vh;

  height: 100%;
  width: max-content;
  align-items: center;
  position: relative;
  will-change: transform;
}
.timeline-section{

}
.svg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.curve-svg {
  width: 100%;
  height: 100%;
  display: block;
  opacity: 0.5;
}

#moving-object {
  width: 8rem;
  height: 8rem;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;

  display: flex;
  justify-content: center;
  align-items: center;
}

#moving-object img {

  object-fit: contain;
}

.stage-card {
  width: 25vw;
  max-width: 40rem;
  min-width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  z-index: 5;
  margin-top: 10vh;
  color: var(--color-text-dark);
}

.step-index {
  font-size: 6rem;
  font-weight: bold;
  color: var(--color-text-accent);
  line-height: 1;
  position: absolute;
  top: -5rem;
  left: 0;
  z-index: -1;
}

h3 {
  font-size: 2rem;
  text-transform: uppercase;
  margin: 0;
  font-weight: bold;
}

p {
  font-size: 1rem;
  line-height: 1.5;
  opacity: 0.8;
}

@media screen and (max-width: 768px) {
  .timeline-wrapper {
    gap: 10vw;
    padding-right: 30vh;
  }

  .stage-card {
    width: 70vw;
    min-width: 250px;
  }

  .step-index {
    font-size: 4rem;
    top: -3.5rem;
  }
}
</style>