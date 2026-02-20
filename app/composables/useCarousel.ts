import { ref, onMounted, onUnmounted, nextTick, type Ref } from 'vue';

export const useCarousel = (
    itemsList: () => any[],
    durationMs: number = 10000
) => {
    const activeIndex = ref(0);
    let timer: ReturnType<typeof setInterval> | null = null;

    const nextSlide = () => {
        const list = itemsList();
        if (list && list.length > 0) {
            activeIndex.value = (activeIndex.value + 1) % list.length;
        }
    };

    const startTimer = () => {
        stopTimer();
        if (import.meta.client) {
            timer = setInterval(nextSlide, durationMs);
        }
    };

    const stopTimer = () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    };

    const setActive = async (index: number) => {
        if (activeIndex.value === index) {
            activeIndex.value = -1;
            await nextTick();
        }
        activeIndex.value = index;
        startTimer();
    };

    onMounted(() => {
        startTimer();
    });

    onUnmounted(() => {
        stopTimer();
    });

    return {
        activeIndex,
        setActive,
        startTimer,
        stopTimer,
        nextSlide
    };
};
