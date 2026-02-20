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
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'CursorComponent',
  setup() {
    const cursor = ref(null);
    const route = useRoute();

    const elements = [
      { selector: '#main a', radius: 50, fit: false },
      { selector: 'header nav a', radius: 10, fit: true, fitPadding: 0, magnetic: true, magneticPadding: 10  },
      { selector: 'footer a', radius: 10, fit: true, fitPadding: 0, magnetic: true, magneticPadding: 10  },
      { selector: '.menu_button', radius: 10, follow: 0, borderRadius: 10, fit: true, fitPadding: 10, magnetic: true, magneticPadding: 30 },
      { selector: '.burger-btn.mobile-only', radius: 10, follow: 0, fit: true, fitPadding: 10 },
      { selector: '.item-wrapper h3', radius: 50, follow: 0, fit: false },
      { selector: '.project_card', radius: 50, follow: 0, fit: false, text: 'VIEW PROJECT  •  ', textMargin: 5 },
      { selector: '.faq_text', radius: 8, follow: 0, fit: true, fitPadding: 15 },
      { selector: '.ul_folder a', radius: 5, follow: 10, fit: true, fitPadding: 0 },
      { selector: 'span.faq_button', radius: 5, follow: 10, fit: true, fitPadding: 5 },
      { selector: 'span.child_buttton', radius: 5, follow: 0, fit: true, fitPadding: 5 },
      { selector: '.closeBtn', radius: 5, follow: 0, fit: true, fitPadding: 5 },
      { selector: '.menu_link', radius: 30, follow: 0, fit: false },
    ];

    const DEFAULT_SIZE = 32;
    const DEFAULT_BORDER_RADIUS = '50%';
    const CURSOR_LERP_RATE = 0.20;
    const FOLLOW_LERP_RATE = 0.15;
    const CLICK_ANIMATION_TIMEOUT = 180;

    const textState = reactive({
      visible: false,
      content: null,
      repeatedString: '',
      diameter: 0
    });

    const baseCursorStyle = {
      width: `${DEFAULT_SIZE}px`,
      height: `${DEFAULT_SIZE}px`,
      borderRadius: DEFAULT_BORDER_RADIUS,
    };

    let domObserver = null;
    let initializationTimeout = null;
    const activeListeners = new Map();
    const activeFollowTargets = new Set();

    let currentMagneticCtx = null;
    let cursorRafId = null;
    let followRafId = null;
    const mousePos = { x: 0, y: 0 };
    const cursorState = { tx: 0, ty: 0, x: 0, y: 0 };

    const measureTextWidth = (text, fontSize = '12px', fontFamily = 'Arial') => {
      const canvas = measureTextWidth.canvas || (measureTextWidth.canvas = document.createElement('canvas'));
      const context = canvas.getContext('2d');
      context.font = `${fontSize} ${fontFamily}`;
      return context.measureText(text).width;
    };

    const updateTextState = (el, cfg, cursorWidth, cursorHeight) => {
      if (!cfg.text) {
        textState.visible = false;
        textState.content = null;
        return;
      }

      const baseRadius = Math.max(cursorWidth, cursorHeight) / 2;
      const margin = cfg.textMargin || 0;
      const totalRadius = baseRadius + margin;

      const diameter = totalRadius * 2;
      const circumference = Math.PI * diameter;

      const textSegment = cfg.text;
      const segmentWidth = measureTextWidth(textSegment, '10px', 'sans-serif');

      const repetitions = Math.max(1, Math.ceil(circumference / segmentWidth));

      textState.content = cfg.text;
      textState.repeatedString = textSegment.repeat(repetitions);
      textState.diameter = Math.round(diameter);
      textState.visible = true;
    };

    if (route) {
      watch(() => route.path, () => {
        if (cursor.value) {
          Object.assign(cursor.value.style, baseCursorStyle);
          cursor.value.classList.remove('cursor--clicked');
          activeFollowTargets.clear();
          currentMagneticCtx = null;
          textState.visible = false;
        }
      });
    }

    const checkActiveZones = () => {
      if (activeFollowTargets.size === 0) return;
      activeFollowTargets.forEach((ctx) => {
        if (!ctx.el) return;
        const rect = ctx.el.getBoundingClientRect();
        ctx.rect = rect;
        const pad = (ctx.cfg.magnetic && ctx.cfg.magneticPadding) ? ctx.cfg.magneticPadding : 0;
        const isInside =
            mousePos.x >= rect.left - pad &&
            mousePos.x <= rect.right + pad &&
            mousePos.y >= rect.top - pad &&
            mousePos.y <= rect.bottom + pad;

        if (!isInside) {
          activeFollowTargets.delete(ctx);
          if (currentMagneticCtx === ctx) currentMagneticCtx = null;
          if (ctx.target) ctx.target.style.transform = '';
          if (activeFollowTargets.size === 0 && cursor.value) {
            handleMouseLeave();
          }
        }
      });
    };

    const animateMainCursor = () => {
      if (!cursor.value) {
        cursorRafId = null;
        return;
      }

      if (currentMagneticCtx && currentMagneticCtx.rect) {
        const rect = currentMagneticCtx.rect;
        cursorState.tx = rect.left + rect.width / 2;
        cursorState.ty = rect.top + rect.height / 2;
      } else {
        cursorState.tx = mousePos.x;
        cursorState.ty = mousePos.y;
      }

      cursorState.x += (cursorState.tx - cursorState.x) * CURSOR_LERP_RATE;
      cursorState.y += (cursorState.ty - cursorState.y) * CURSOR_LERP_RATE;

      cursor.value.style.transform = `translate3d(${cursorState.x}px, ${cursorState.y}px, 0) translate(-50%, -50%)`;

      const isIdle = Math.abs(cursorState.tx - cursorState.x) < 0.1 && Math.abs(cursorState.ty - cursorState.y) < 0.1;

      if (isIdle && !currentMagneticCtx) {
        cursorState.x = cursorState.tx;
        cursorState.y = cursorState.ty;
        cursor.value.style.transform = `translate3d(${cursorState.x}px, ${cursorState.y}px, 0) translate(-50%, -50%)`;
        cursorRafId = null;
      } else {
        cursorRafId = requestAnimationFrame(animateMainCursor);
      }
    };

    const onMouseMoveWindow = (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      checkActiveZones();
      if (!cursorRafId) {
        cursorRafId = requestAnimationFrame(animateMainCursor);
      }
    };

    const animateFollow = () => {
      if (activeFollowTargets.size === 0) {
        followRafId = null;
        return;
      }
      activeFollowTargets.forEach((ctx) => {
        const { target, state } = ctx;
        state.x += (state.tx - state.x) * FOLLOW_LERP_RATE;
        state.y += (state.ty - state.y) * FOLLOW_LERP_RATE;
        target.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
      });
      if (activeFollowTargets.size > 0) {
        followRafId = requestAnimationFrame(animateFollow);
      } else {
        followRafId = null;
      }
    };

    const getElementConfig = (el) => {
      if (!el) return null;
      for (const cfg of elements) {
        if (el.matches(cfg.selector)) return cfg;
      }
      return null;
    };

    const calculateCursorSize = (el, cfg) => {
      if (!cfg) return { width: DEFAULT_SIZE, height: DEFAULT_SIZE };
      if (cfg.fit || cfg.magnetic) {
        const rect = el.getBoundingClientRect();
        const pad = cfg.fitPadding || 0;
        const width = Math.max(8, rect.width + pad * 2);
        const height = Math.max(8, rect.height + pad * 2);
        return { width: Math.round(width), height: Math.round(height) };
      }
      const radius = cfg.radius || DEFAULT_SIZE / 2;
      const diameter = Math.max(8, radius * 2);
      return { width: diameter, height: diameter };
    };

    const computeBorderRadius = (el, cfg) => {
      if (cfg?.borderRadius) return `${cfg.borderRadius}px`;
      if (cfg?.radius) return `${cfg.radius}px`;
      if (cfg?.fit || cfg?.magnetic) {
        return window.getComputedStyle(el).borderRadius || DEFAULT_BORDER_RADIUS;
      }
      return DEFAULT_BORDER_RADIUS;
    };

    const findFollowTarget = (el) => {
      if (!el) return null;
      return el.querySelector('[data-cursor-follow]') || el.querySelector('span, img, svg, i') || el;
    };

    const createFollowHandler = (el, cfg) => {
      const target = findFollowTarget(el);
      const state = { x: 0, y: 0, tx: 0, ty: 0 };
      const ctx = { target, state, el, rect: null, cfg };

      return (e) => {
        if (e.type === 'mouseenter') {
          ctx.rect = el.getBoundingClientRect();
          activeFollowTargets.add(ctx);
          if (cfg.magnetic) currentMagneticCtx = ctx;
          if (!followRafId && target) followRafId = requestAnimationFrame(animateFollow);
        } else if (e.type === 'mouseleave') {
          if (cfg.magnetic) return;
          activeFollowTargets.delete(ctx);
        } else {
          if (!ctx.rect) ctx.rect = el.getBoundingClientRect();
          if (target && cfg.follow) {
            const relX = e.clientX - ctx.rect.left;
            const relY = e.clientY - ctx.rect.top;
            state.tx = (relX / ctx.rect.width - 0.5) * 2 * cfg.follow;
            state.ty = (relY / ctx.rect.height - 0.5) * 2 * cfg.follow;
          }
        }
      };
    };

    const handleMouseEnter = (e) => {
      const el = e ? e.currentTarget : null;
      if (!el) return;
      const cfg = getElementConfig(el);
      if (!cfg || !cursor.value) return;
      if (cursor.value.classList.contains('cursor--clicked')) return;

      const { width, height } = calculateCursorSize(el, cfg);
      cursor.value.style.width = `${width}px`;
      cursor.value.style.height = `${height}px`;
      cursor.value.style.borderRadius = computeBorderRadius(el, cfg);

      updateTextState(el, cfg, width, height);
    };

    const handleMouseLeave = () => {
      if (!cursor.value) return;
      if (cursor.value.classList.contains('cursor--clicked')) return;
      Object.assign(cursor.value.style, baseCursorStyle);

      textState.visible = false;
      textState.content = null;
    };

    // const handleClick = () => {
    //   if (!cursor.value || cursor.value.classList.contains('cursor--clicked')) return;
    //
    //   cursor.value.classList.add('cursor--clicked');
    //   const rect = cursor.value.getBoundingClientRect();
    //   const clickedSize = Math.max(rect.width, rect.height) * 1.5;
    //
    //   cursor.value.style.width = `${clickedSize}px`;
    //   cursor.value.style.height = `${clickedSize}px`;
    //
    //   setTimeout(() => {
    //     if (cursor.value) {
    //       cursor.value.classList.remove('cursor--clicked');
    //       if (activeFollowTargets.size > 0) {
    //         const ctx = activeFollowTargets.values().next().value;
    //         if (ctx) {
    //           const { width, height } = calculateCursorSize(ctx.el, ctx.cfg);
    //           cursor.value.style.width = `${width}px`;
    //           cursor.value.style.height = `${height}px`;
    //           cursor.value.style.borderRadius = computeBorderRadius(ctx.el, ctx.cfg);
    //           return;
    //         }
    //       }
    //       Object.assign(cursor.value.style, baseCursorStyle);
    //     }
    //   }, CLICK_ANIMATION_TIMEOUT);
    // };

    const clearAllListeners = () => {
      activeListeners.forEach((handlers, el) => {
        handlers.forEach(({ event, handler }) => {
          el.removeEventListener(event, handler);
        });
      });
      activeListeners.clear();
      window.removeEventListener('mousemove', onMouseMoveWindow);
      // window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', checkActiveZones);
    };

    const initializeCursor = () => {
      clearAllListeners();
      try {
        const allSelectors = elements.map((c) => c.selector).join(', ');
        if (!allSelectors) return;

        document.querySelectorAll(allSelectors).forEach((el) => {
          const cfg = getElementConfig(el);
          if (!cfg) return;

          const followHandler = createFollowHandler(el, cfg);
          const handlers = [
            { event: 'mouseenter', handler: (e) => {
                handleMouseEnter(e);
                followHandler(e);
              }},
            { event: 'mouseleave', handler: (e) => {
                if (!cfg.magnetic) handleMouseLeave();
                followHandler(e);
              }},
            { event: 'mousemove', handler: followHandler },
          ];

          handlers.forEach(({ event, handler }) => {
            el.addEventListener(event, handler, { passive: true });
          });
          activeListeners.set(el, handlers);
        });

        window.addEventListener('mousemove', onMouseMoveWindow, { passive: true });
        // window.addEventListener('click', handleClick, { passive: true });
        window.addEventListener('scroll', checkActiveZones, { passive: true, capture: true });
      } catch (err) {
        console.error('Error initializing cursor:', err);
      }
    };

    const debounce = (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    };

    const reinitializeWithRetries = debounce((attempt = 1) => {
      if (attempt > 5) return;
      initializeCursor();
    }, 150);

    const setupDOMObserver = () => {
      const allSelectors = elements.map((c) => c.selector).join(', ');
      domObserver = new MutationObserver((mutations) => {
        const shouldReinit = mutations.some((mutation) =>
            Array.from(mutation.addedNodes).some((node) => node.nodeType === 1 && (node.matches(allSelectors) || node.querySelector(allSelectors))) ||
            Array.from(mutation.removedNodes).some((node) => node.nodeType === 1 && activeListeners.has(node))
        );

        if (shouldReinit) {
          clearTimeout(initializationTimeout);
          initializationTimeout = setTimeout(() => reinitializeWithRetries(), 150);
        }
      });
      domObserver.observe(document.body, { childList: true, subtree: true });
    };

    const forceReinit = () => reinitializeWithRetries();

    onMounted(() => {
      if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) {
        return;
      }
      window.cursorForceReinit = forceReinit;
      if (cursor.value) {
        Object.assign(cursor.value.style, baseCursorStyle);
      }
      initializationTimeout = setTimeout(() => {
        reinitializeWithRetries();
        setupDOMObserver();
      }, 100);
    });

    onUnmounted(() => {
      clearAllListeners();
      if (domObserver) domObserver.disconnect();
      if (initializationTimeout) clearTimeout(initializationTimeout);
      if (cursorRafId) cancelAnimationFrame(cursorRafId);
      if (followRafId) cancelAnimationFrame(followRafId);
      delete window.cursorForceReinit;
    });

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