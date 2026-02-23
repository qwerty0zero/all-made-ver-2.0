import { onMounted, onUnmounted, nextTick, watch, type Ref } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

if (import.meta.client) {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

export const useTimelineAnimation = (
    sectionRef: Ref<HTMLElement | null>,
    wrapperRef: Ref<HTMLElement | null>,
    dependenciesToWatch: () => any
) => {
    let mm: gsap.MatchMedia | null = null;

    const getScrollAmount = (direction: 'horizontal' | 'vertical') => {
        if (!wrapperRef.value) return 0;
        if (direction === 'horizontal') {
            const wrapperWidth = wrapperRef.value.scrollWidth;
            return -(wrapperWidth - window.innerWidth + 200);
        } else {
            const wrapperHeight = wrapperRef.value.scrollHeight;
            return -(wrapperHeight - window.innerHeight + 200);
        }
    };

    const initAnimations = () => {
        if (mm) mm.revert();
        mm = gsap.matchMedia();

        mm.add("(min-width: 769px)", () => {
            if (!wrapperRef.value || !sectionRef.value) return;
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
            if (!wrapperRef.value || !sectionRef.value) return;
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
    };

    onMounted(() => {
        if (!import.meta.client) return;
        nextTick(() => {
            document.fonts.ready.then(() => {
                initAnimations();
            });
        });
    });

    watch(dependenciesToWatch, () => {
        nextTick(() => {
            ScrollTrigger.refresh();
            initAnimations();
        });
    }, { deep: true });

    onUnmounted(() => {
        if (mm) mm.revert();
    });

    return { initAnimations };
};
