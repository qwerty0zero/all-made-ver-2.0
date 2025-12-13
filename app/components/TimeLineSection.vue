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

let mm: gsap.MatchMedia | null = null;

const getScrollAmount = (direction: string) => {
  if (!wrapperRef.value) return 0;

  if (direction === 'horizontal') {
    const wrapperWidth = wrapperRef.value.scrollWidth;
    return -(wrapperWidth - window.innerWidth + 200);
  } else {
    const wrapperHeight = wrapperRef.value.scrollHeight;
    return -(wrapperHeight - window.innerHeight + 200);
  }
};

onMounted(() => {
  nextTick(() => {
    document.fonts.ready.then(() => {
      if (!sectionRef.value || !wrapperRef.value) return;

      mm = gsap.matchMedia();

      mm.add("(min-width: 769px)", () => {
        const scrollAmount = getScrollAmount('horizontal');

        gsap.to(wrapperRef.value, {
          x: scrollAmount,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.value,
            start: "top top",
            end: () => `+=${Math.abs(scrollAmount)}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            toggleClass: "is-pinned"
          }
        });

        gsap.to("#moving-object", {
          motionPath: {
            path: "#track-path-desktop",
            align: "#track-path-desktop",
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
            end: () => `+=${Math.abs(scrollAmount)}`,
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
      });

      mm.add("(max-width: 768px)", () => {
        const scrollAmount = getScrollAmount('vertical');

        gsap.to(wrapperRef.value, {
          y: scrollAmount,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.value,
            start: "top top",
            end: () => `+=${Math.abs(scrollAmount)}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            toggleClass: "is-pinned"
          }
        });

        gsap.to("#moving-object", {
          motionPath: {
            path: "#track-path-mobile",
            align: "#track-path-mobile",
            alignOrigin: [0.5, 0.5],
            autoRotate: 90,
            start: 0,
            end: 1,
          },
          transformOrigin: "50% 50%",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.value,
            start: "top top",
            end: () => `+=${Math.abs(scrollAmount)}`,
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
      });

    });
  });
});

onUnmounted(() => {
  if (mm) mm.revert();
});

const formatIndex = (i: number) => {
  return String(i + 1).padStart(2, '0');
};
</script>

<template>
  <section class="timeline-section" ref="sectionRef">
    <div class="timeline-wrapper" ref="wrapperRef">

      <div class="svg-container">

        <svg class="curve-svg desktop-curve" viewBox="0 0 4200 400" preserveAspectRatio="none" fill="none">
          <path
              id="track-path-desktop"
              d="M 0 200 Q 250 50 500 200 T 1000 200 T 1500 200 T 2000 200 T 2500 200 T 3000 200 T 3500 200 T 4000 200 L 4200 200"
              stroke="#AE9675" stroke-width="4" fill="none" vector-effect="non-scaling-stroke"
          />
        </svg>

        <svg class="curve-svg mobile-curve" viewBox="0 0 400 4200" preserveAspectRatio="none" fill="none">
          <path
              id="track-path-mobile"
              d="M 200 0 Q 350 250 200 500 T 200 1000 T 200 1500 T 200 2000 T 200 2500 T 200 3000 T 200 3500 T 200 4000 L 200 4200"
              stroke="#AE9675" stroke-width="4" fill="none" vector-effect="non-scaling-stroke"
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

.timeline-section::after {
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
.timeline-section.is-pinned::after {
  background-color: white;
}

.timeline-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  will-change: transform;
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
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.stage-card {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  z-index: 5;
  color: var(--color-text-dark);
}

.step-index {
  font-weight: bold;
  color: var(--color-text-accent);
  line-height: 1;
  position: absolute;
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

@media screen and (min-width: 769px) {
  .timeline-wrapper {
    flex-direction: row;
    height: 100%;
    width: max-content;
    gap: 15vw;
    padding-left: 10vw;
    padding-right: 60vh;
  }

  .stage-card {
    width: 25vw;
    max-width: 40rem;
    min-width: 300px;
    margin-top: 10vh;
  }

  .step-index {
    font-size: 6rem;
    top: -5rem;
    left: 0;
  }

  .mobile-curve { display: none; }
}

@media screen and (max-width: 768px) {
  .timeline-wrapper {
    flex-direction: column;
    width: 100%;
    height: max-content;
    gap: 30vh;
    padding-top: 40vh;
    padding-bottom: 50vh;
    align-items: center;
  }

  .stage-card {
    width: 80vw;
    text-align: center;
    align-items: center;
    padding: 1rem;
    backdrop-filter: blur(5px);
    border-radius: 12px;
  }

  .step-index {
    font-size: 8rem;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.15;
  }

  .desktop-curve { display: none; }

  .mobile-curve {
    display: block;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  .svg-container {
    height: 100%;
    position: absolute;
  }

  #moving-object {
    width: 5rem;
    height: 5rem;
  }
  #moving-object img {
    transform: rotate(180deg);
  }
}
</style>