<template>
  <div ref="cursor" class="cursor" :class="{mono_color: textState.visible && textState.content}">
    <div
        v-if="textState.visible && textState.content"
        class="cursor-text-ring"
        :style="{
        width: `${textState.diameter}px`,
        height: `${textState.diameter}px`,
        animationDuration: '10s'
      }"
    >
      <svg
          :width="textState.diameter"
          :height="textState.diameter"
          viewBox="0 0 100 100"
          style="overflow: visible;"
      >
        <defs>
          <path
              id="textCircle"
              d="M 50, 50 m -50, 0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0"
          />
        </defs>
        <text class="circle-text">
          <textPath
              xlink:href="#textCircle"
              textLength="314"
              lengthAdjust="spacing"
          >
            {{ textState.repeatedString }}
          </textPath>
        </text>
      </svg>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useCustomCursor } from '~/composables/useCustomCursor';

export default {
  name: 'CursorComponent',
  setup() {
    const cursor = ref(null);
    const { textState } = useCustomCursor(cursor);

    return { cursor, textState };
  },
};
</script>

<style>
a span,
button span,
.menu_button span,
.faq_text span,
.child_buttton span {
  display: inline-block;
  transition: transform 0.12s linear;
  pointer-events: none;
}

.cursor {
  position: fixed;
  pointer-events: none;
  top: 0;
  left: 0;
  z-index: 9999999;
  width: 32px;
  height: 32px;
  background-color: #fff;
  mix-blend-mode: difference;
  transition: width 0.22s ease, height 0.22s ease, border-radius 0.22s ease;
  will-change: transform, width, height, border-radius;
  transform: translate3d(0,0,0);

  display: flex;
  align-items: center;
  justify-content: center;
}
.mono_color{
  mix-blend-mode: unset;

}
.cursor-text-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: spin linear infinite;
}

.circle-text {
  font-family: sans-serif;
  font-size: 10px;
  font-weight: 600;
  fill: #fff;
  text-transform: uppercase;
  letter-spacing: 2px;
}

@keyframes spin {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>