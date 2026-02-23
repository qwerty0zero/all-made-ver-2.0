import { ref, onMounted } from 'vue';

const y = ref(0);
const isScrolled = ref(false);
let isInitialized = false;
let ticking = false;

const listeners = new Set<() => void>();

const handleScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      y.value = window.scrollY;
      isScrolled.value = y.value > 50;
      
      listeners.forEach(cb => cb());
      
      ticking = false;
    });
    ticking = true;
  }
};

export const useWindowScroll = () => {
  onMounted(() => {
    if (!import.meta.client) return;
    
    if (!isInitialized) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      isInitialized = true;

        y.value = window.scrollY;
      isScrolled.value = y.value > 50;
    }
  });

  const onScroll = (cb: () => void) => {
    listeners.add(cb);
  };

  const offScroll = (cb: () => void) => {
    listeners.delete(cb);
  };

  return {
    y,
    isScrolled,
    onScroll,
    offScroll
  };
};
