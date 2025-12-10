<template>
  <div ref="cursor" class="cursor"></div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  name: 'CursorComponent',
  setup() {
    const cursor = ref(null);

    const elements = [
      { selector: '#main a', radius: 50, follow: 10, fit: false },
      { selector: 'header a', radius: 10, follow: 10, fit: true, fitPadding: 0 },
      { selector: 'footer a', radius: 10, follow: 10, fit: true, fitPadding: 10 },
      { selector: '.burger-btn.mobile-only', radius: 10, follow: 0, fit: true, fitPadding: 10 },

      { selector: '.item-wrapper h3', radius: 50, follow: 0, fit: false },
      { selector: '.project_card', radius: 50, follow: 0, fit: false },

      { selector: '.faq_text', radius: 8, follow: 0, fit: true, fitPadding: 15 },
      { selector: '.menu_button', radius: 10, follow: 0, borderRadius: 10, fit: true, fitPadding: 10 },
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

    const baseCursorStyle = {
      width: `${DEFAULT_SIZE}px`,
      height: `${DEFAULT_SIZE}px`,
      borderRadius: DEFAULT_BORDER_RADIUS,
    };

    let domObserver = null;
    let initializationTimeout = null;
    const activeListeners = new Map();

    const cursorState = {
      tx: 0,
      ty: 0,
      x: 0,
      y: 0,
      rafId: null,
    };

    const animateMainCursor = () => {
      if (!cursor.value) {
        cursorState.rafId = null;
        return;
      }

      cursorState.x += (cursorState.tx - cursorState.x) * CURSOR_LERP_RATE;
      cursorState.y += (cursorState.ty - cursorState.y) * CURSOR_LERP_RATE;

      cursor.value.style.transform = `translate3d(${cursorState.x}px, ${cursorState.y}px, 0) translate(-50%, -50%)`;

      const isIdle = Math.abs(cursorState.tx - cursorState.x) < 0.1 && Math.abs(cursorState.ty - cursorState.y) < 0.1;

      if (isIdle) {
        cursorState.x = cursorState.tx;
        cursorState.y = cursorState.ty;
        cursor.value.style.transform = `translate3d(${cursorState.x}px, ${cursorState.y}px, 0) translate(-50%, -50%)`;
        cursorState.rafId = null;
      } else {
        cursorState.rafId = requestAnimationFrame(animateMainCursor);
      }
    };

    const updateCursorPosition = (e) => {
      cursorState.tx = e.clientX;
      cursorState.ty = e.clientY;
      if (!cursorState.rafId) {
        cursorState.rafId = requestAnimationFrame(animateMainCursor);
      }
    };

    const activeFollowTargets = new Set();
    let followRafId = null;

    const animateFollow = () => {
      if (activeFollowTargets.size === 0) {
        followRafId = null;
        return;
      }

      activeFollowTargets.forEach((ctx) => {
        const { target, state } = ctx;
        state.x += (state.tx - state.x) * FOLLOW_LERP_RATE;
        state.y += (state.ty - state.y) * FOLLOW_LERP_RATE;

        if (Math.abs(state.tx - state.x) < 0.01 && Math.abs(state.ty - state.y) < 0.01) {
          state.x = state.tx;
          state.y = state.ty;
          if (state.x === 0 && state.y === 0) {
            activeFollowTargets.delete(ctx);
            target.style.transform = '';
            return;
          }
        }
        target.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
      });

      followRafId = requestAnimationFrame(animateFollow);
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

      if (cfg.fit) {
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
      if (cfg?.fit) {
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
      if (!target || !cfg?.follow) return () => {};

      const state = { x: 0, y: 0, tx: 0, ty: 0 };
      const ctx = { target, state };

      return (e) => {
        if (e.type === 'mouseleave') {
          state.tx = 0;
          state.ty = 0;
        } else {
          const rect = el.getBoundingClientRect();
          const relX = e.clientX - rect.left;
          const relY = e.clientY - rect.top;
          state.tx = (relX / rect.width - 0.5) * 2 * cfg.follow;
          state.ty = (relY / rect.height - 0.5) * 2 * cfg.follow;
        }

        activeFollowTargets.add(ctx);
        if (!followRafId) followRafId = requestAnimationFrame(animateFollow);
      };
    };

    const handleMouseEnter = (e) => {
      const el = e.currentTarget;
      const cfg = getElementConfig(el);
      if (!cfg || !cursor.value) return;

      if (cursor.value.classList.contains('cursor--clicked')) return;

      const { width, height } = calculateCursorSize(el, cfg);
      cursor.value.style.width = `${width}px`;
      cursor.value.style.height = `${height}px`;
      cursor.value.style.borderRadius = computeBorderRadius(el, cfg);
    };

    const handleMouseLeave = () => {
      if (!cursor.value) return;
      if (cursor.value.classList.contains('cursor--clicked')) return;

      Object.assign(cursor.value.style, baseCursorStyle);
    };

    const handleClick = () => {
      if (!cursor.value || cursor.value.classList.contains('cursor--clicked')) return;

      // Проверяем, находится ли курсор над элементом из elements
      const elUnderCursor = document.elementFromPoint(cursorState.tx, cursorState.ty);
      const cfg = getElementConfig(elUnderCursor);
      if (cfg) return; // Пропускаем анимацию увеличения для элементов из elements

      cursor.value.classList.add('cursor--clicked');

      const rect = cursor.value.getBoundingClientRect();
      const clickedSize = Math.max(rect.width, rect.height) * 1.5;

      cursor.value.style.width = `${clickedSize}px`;
      cursor.value.style.height = `${clickedSize}px`;

      setTimeout(() => {
        if (cursor.value) {
          cursor.value.classList.remove('cursor--clicked');

          const elUnderCursor = document.elementFromPoint(cursorState.tx, cursorState.ty);
          const cfg = getElementConfig(elUnderCursor);

          if (cfg) {
            const { width, height } = calculateCursorSize(elUnderCursor, cfg);
            cursor.value.style.width = `${width}px`;
            cursor.value.style.height = `${height}px`;
            cursor.value.style.borderRadius = computeBorderRadius(elUnderCursor, cfg);
          } else {
            Object.assign(cursor.value.style, baseCursorStyle);
          }
        }
      }, CLICK_ANIMATION_TIMEOUT);
    };

    const clearAllListeners = () => {
      activeListeners.forEach((handlers, el) => {
        handlers.forEach(({ event, handler }) => {
          el.removeEventListener(event, handler);
        });
      });
      activeListeners.clear();
      window.removeEventListener('mousemove', updateCursorPosition);
      window.removeEventListener('click', handleClick);
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
            { event: 'mouseenter', handler: handleMouseEnter },
            { event: 'mouseleave', handler: handleMouseLeave },
            { event: 'mousemove', handler: followHandler },
            { event: 'mouseleave', handler: followHandler },
          ];

          handlers.forEach(({ event, handler }) => {
            el.addEventListener(event, handler, { passive: true });
          });
          activeListeners.set(el, handlers);
        });

        window.addEventListener('mousemove', updateCursorPosition, { passive: true });
        window.addEventListener('click', handleClick, { passive: true });
      } catch (err) {
        console.error('Error initializing cursor:', err);
      }
    };

    // Дебаунсинг для reinitializeWithRetries
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
      if (activeListeners.size === 0) {
        initializationTimeout = setTimeout(() => reinitializeWithRetries(attempt + 1), 200 * attempt);
      }
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
      if (cursorState.rafId) cancelAnimationFrame(cursorState.rafId);
      if (followRafId) cancelAnimationFrame(followRafId);
      delete window.cursorForceReinit;
    });

    return { cursor };
  },
};
</script>

<style>
span {
  display: inline-block;
  transition: transform 0.12s linear;
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
}
</style>