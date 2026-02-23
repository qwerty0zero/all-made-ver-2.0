import { reactive, onMounted, onUnmounted, watch, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useWindowScroll } from '~/composables/useWindowScroll';

export const DEFAULT_SIZE = 32;
export const DEFAULT_BORDER_RADIUS = '50%';
export const CURSOR_LERP_RATE = 0.20;
export const FOLLOW_LERP_RATE = 0.15;
export const CLICK_ANIMATION_TIMEOUT = 180;

export const cursorElements = [
    { selector: '#main a', radius: 50, fit: false },
    { selector: 'header nav a', radius: 10, fit: true, fitPadding: 0, magnetic: true, magneticPadding: 10 },
    { selector: 'footer a', radius: 10, fit: true, fitPadding: 0, magnetic: true, magneticPadding: 10 },
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

export const useCustomCursor = (cursorRef: Ref<HTMLElement | null>) => {
    const route = useRoute();
    const { onScroll, offScroll } = useWindowScroll();

    const textState = reactive({
        visible: false,
        content: null as string | null,
        repeatedString: '',
        diameter: 0
    });

    const baseCursorStyle = {
        width: `${DEFAULT_SIZE}px`,
        height: `${DEFAULT_SIZE}px`,
        borderRadius: DEFAULT_BORDER_RADIUS,
    };

    let domObserver: MutationObserver | null = null;
    let initializationTimeout: ReturnType<typeof setTimeout> | null = null;
    const activeListeners = new Map<Element, Array<{ event: string, handler: EventListener }>>();
    const activeFollowTargets = new Set<any>();

    let currentMagneticCtx: any = null;
    let cursorRafId: number | null = null;
    let followRafId: number | null = null;
    const mousePos = { x: 0, y: 0 };
    const cursorState = { tx: 0, ty: 0, x: 0, y: 0 };

    const measureTextWidth = (text: string, fontSize = '10px', fontFamily = 'sans-serif') => {
        if (!import.meta.client) return 0;
        const canvas = (measureTextWidth as any).canvas || ((measureTextWidth as any).canvas = document.createElement('canvas'));
        const context = canvas.getContext('2d');
        context.font = `${fontSize} ${fontFamily}`;
        return context.measureText(text).width;
    };

    const updateTextState = (el: Element, cfg: any, cursorWidth: number, cursorHeight: number) => {
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
        const segmentWidth = measureTextWidth(textSegment);

        const repetitions = Math.max(1, Math.ceil(circumference / segmentWidth));

        textState.content = cfg.text;
        textState.repeatedString = textSegment.repeat(repetitions);
        textState.diameter = Math.round(diameter);
        textState.visible = true;
    };

    if (route) {
        watch(() => route.path, () => {
            if (cursorRef.value) {
                Object.assign(cursorRef.value.style, baseCursorStyle);
                cursorRef.value.classList.remove('cursor--clicked');
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
                if (activeFollowTargets.size === 0 && cursorRef.value) {
                    handleMouseLeave();
                }
            }
        });
    };

    const animateMainCursor = () => {
        if (!cursorRef.value) {
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

        cursorRef.value.style.transform = `translate3d(${cursorState.x}px, ${cursorState.y}px, 0) translate(-50%, -50%)`;

        const isIdle = Math.abs(cursorState.tx - cursorState.x) < 0.1 && Math.abs(cursorState.ty - cursorState.y) < 0.1;

        if (isIdle && !currentMagneticCtx) {
            cursorState.x = cursorState.tx;
            cursorState.y = cursorState.ty;
            cursorRef.value.style.transform = `translate3d(${cursorState.x}px, ${cursorState.y}px, 0) translate(-50%, -50%)`;
            cursorRafId = null;
        } else {
            cursorRafId = requestAnimationFrame(animateMainCursor);
        }
    };

    const onMouseMoveWindow = (e: MouseEvent) => {
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
            if (target) target.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
        });
        if (activeFollowTargets.size > 0) {
            followRafId = requestAnimationFrame(animateFollow);
        } else {
            followRafId = null;
        }
    };

    const getElementConfig = (el: Element) => {
        if (!el) return null;
        for (const cfg of cursorElements) {
            if (el.matches(cfg.selector)) return cfg;
        }
        return null;
    };

    const calculateCursorSize = (el: Element, cfg: any) => {
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

    const computeBorderRadius = (el: Element, cfg: any) => {
        if (cfg?.borderRadius) return `${cfg.borderRadius}px`;
        if (cfg?.radius) return `${cfg.radius}px`;
        if (cfg?.fit || cfg?.magnetic) {
            return window.getComputedStyle(el).borderRadius || DEFAULT_BORDER_RADIUS;
        }
        return DEFAULT_BORDER_RADIUS;
    };

    const findFollowTarget = (el: Element) => {
        if (!el) return null;
        return el.querySelector('[data-cursor-follow]') || el.querySelector('span, img, svg, i') || el;
    };

    const createFollowHandler = (el: Element, cfg: any) => {
        const target = findFollowTarget(el) as HTMLElement;
        const state = { x: 0, y: 0, tx: 0, ty: 0 };
        const ctx = { target, state, el, rect: null as DOMRect | null, cfg };

        return (e: Event) => {
            const mouseEvent = e as MouseEvent;
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
                    const relX = mouseEvent.clientX - ctx.rect.left;
                    const relY = mouseEvent.clientY - ctx.rect.top;
                    state.tx = (relX / ctx.rect.width - 0.5) * 2 * cfg.follow;
                    state.ty = (relY / ctx.rect.height - 0.5) * 2 * cfg.follow;
                }
            }
        };
    };

    const handleMouseEnter = (e: Event) => {
        const el = e.currentTarget as Element;
        if (!el) return;
        const cfg = getElementConfig(el);
        if (!cfg || !cursorRef.value) return;
        if (cursorRef.value.classList.contains('cursor--clicked')) return;

        const { width, height } = calculateCursorSize(el, cfg);
        cursorRef.value.style.width = `${width}px`;
        cursorRef.value.style.height = `${height}px`;
        cursorRef.value.style.borderRadius = computeBorderRadius(el, cfg);

        updateTextState(el, cfg, width, height);
    };

    const handleMouseLeave = () => {
        if (!cursorRef.value) return;
        if (cursorRef.value.classList.contains('cursor--clicked')) return;
        Object.assign(cursorRef.value.style, baseCursorStyle);

        textState.visible = false;
        textState.content = null;
    };

    const clearAllListeners = () => {
        activeListeners.forEach((handlers, el) => {
            handlers.forEach(({ event, handler }) => {
                el.removeEventListener(event, handler);
            });
        });
        activeListeners.clear();

        if (import.meta.client) {
            window.removeEventListener('mousemove', onMouseMoveWindow);
            offScroll(checkActiveZones);
        }
    };

    const initializeCursor = () => {
        clearAllListeners();
        try {
            const allSelectors = cursorElements.map((c) => c.selector).join(', ');
            if (!allSelectors || !import.meta.client) return;

            document.querySelectorAll(allSelectors).forEach((el) => {
                const cfg = getElementConfig(el);
                if (!cfg) return;

                const followHandler = createFollowHandler(el, cfg);
                const handlers = [
                    {
                        event: 'mouseenter', handler: (e: Event) => {
                            handleMouseEnter(e);
                            followHandler(e);
                        }
                    },
                    {
                        event: 'mouseleave', handler: (e: Event) => {
                            if (!cfg.magnetic) handleMouseLeave();
                            followHandler(e);
                        }
                    },
                    { event: 'mousemove', handler: followHandler },
                ];

                handlers.forEach(({ event, handler }) => {
                    el.addEventListener(event, handler, { passive: true });
                });
                activeListeners.set(el, handlers);
            });

            window.addEventListener('mousemove', onMouseMoveWindow, { passive: true });
            onScroll(checkActiveZones);
        } catch (err) {
            console.error('Error initializing cursor:', err);
        }
    };

    const debounce = (func: Function, wait: number) => {
        let timeout: ReturnType<typeof setTimeout>;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const reinitializeWithRetries = debounce((attempt = 1) => {
        if (attempt > 5) return;
        initializeCursor();
    }, 150);

    const setupDOMObserver = () => {
        if (!import.meta.client) return;
        const allSelectors = cursorElements.map((c) => c.selector).join(', ');

        const processMutations = (mutations: MutationRecord[]) => {
            const shouldReinit = mutations.some((mutation) =>
                Array.from(mutation.addedNodes).some((node) => node.nodeType === 1 && ((node as Element).matches(allSelectors) || (node as Element).querySelector(allSelectors))) ||
                Array.from(mutation.removedNodes).some((node) => node.nodeType === 1 && activeListeners.has(node as Element))
            );

            if (shouldReinit) {
                if (initializationTimeout) clearTimeout(initializationTimeout);
                initializationTimeout = setTimeout(() => reinitializeWithRetries(), 150);
            }
        };

        domObserver = new MutationObserver((mutations) => {
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(() => processMutations(mutations));
            } else {
                setTimeout(() => processMutations(mutations), 0);
            }
        });
        domObserver.observe(document.body, { childList: true, subtree: true });
    };

    const forceReinit = () => reinitializeWithRetries();

    onMounted(() => {
        if (!import.meta.client) return;
        if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) {
            return;
        }
        (window as any).cursorForceReinit = forceReinit;
        if (cursorRef.value) {
            Object.assign(cursorRef.value.style, baseCursorStyle);
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
        if (import.meta.client) {
            delete (window as any).cursorForceReinit;
        }
    });

    return { textState, forceReinit };
};
