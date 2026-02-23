import { onMounted, onUnmounted, nextTick, watch, type Ref } from 'vue';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (import.meta.client) {
    gsap.registerPlugin(SplitText, ScrollTrigger);
}

export const useTextReveal = (
    textRef: Ref<HTMLElement | null>,
    dependency: () => any
) => {
    let splitInstance: SplitText | null = null;
    let animContext: gsap.Context | null = null;
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    let lastWidth = 0;

    const animateText = () => {
        if (animContext) animContext.revert();
        if (splitInstance) splitInstance.revert();
        if (!textRef.value) return;

        animContext = gsap.context(() => {
            splitInstance = new SplitText(textRef.value!, {
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
                        trigger: textRef.value,
                        start: "top center+=20%",
                        end: "bottom center+=10%",
                        scrub: 0.5,
                    }
                }
            );
        }, textRef.value);

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
        if (!import.meta.client) return;

        nextTick(() => {
            lastWidth = window.innerWidth;
            setTimeout(() => {
                if (dependency()) {
                    animateText();
                }
            }, 100);

            window.addEventListener('resize', handleResize, { passive: true });
        });
    });

    watch(dependency, () => {
        nextTick(() => animateText());
    });

    onUnmounted(() => {
        if (animContext) animContext.revert();
        if (resizeTimeout) clearTimeout(resizeTimeout);
        if (import.meta.client) {
            window.removeEventListener('resize', handleResize);
        }
    });

    return {
        animateText
    };
};
