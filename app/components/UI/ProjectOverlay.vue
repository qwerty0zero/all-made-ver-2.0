<script setup lang="ts">
import { defineProps, defineEmits, ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue';

interface ProjectData {
  headline: string;
  secondary_text: string;
  description?: string;
  [key: string]: any;
}

const props = defineProps<{
  isVisible: boolean;
  data: ProjectData;
  images: string[];
}>();

const emit = defineEmits(['close']);

const currentIndex = ref(0);
const slideDirection = ref<'next' | 'prev'>('next');
const touchStartX = ref(0);
const touchEndX = ref(0);

const hasImages = computed(() => props.images && props.images.length > 0);
const isSingleImage = computed(() => props.images && props.images.length === 1);

const nextImage = () => {
  if (isSingleImage.value) return;
  slideDirection.value = 'next';
  currentIndex.value = (currentIndex.value + 1) % props.images.length;
};

const prevImage = () => {
  if (isSingleImage.value) return;
  slideDirection.value = 'prev';
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length;
};

const goToImage = (index: number) => {
  if (index === currentIndex.value) return;
  slideDirection.value = index > currentIndex.value ? 'next' : 'prev';
  currentIndex.value = index;
};

const handleTouchStart = (e: TouchEvent) => {
  if (isSingleImage.value) return;
  touchStartX.value = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e: TouchEvent) => {
  if (isSingleImage.value) return;
  touchEndX.value = e.changedTouches[0].screenX;
  handleSwipeGesture();
};

const handleSwipeGesture = () => {
  const threshold = 50;
  const distance = touchStartX.value - touchEndX.value;

  if (Math.abs(distance) > threshold) {
    if (distance > 0) {
      nextImage();
    } else {
      prevImage();
    }
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!props.isVisible) return;
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
  if (e.key === 'Escape') close();
};
const toggleScrollLock = (isLocked: boolean) => {
  if (isLocked) {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }
};
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    currentIndex.value = 0;
    toggleScrollLock(true);
    window.addEventListener('keydown', handleKeydown);
  } else {
    toggleScrollLock(false);
    window.removeEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  toggleScrollLock(false);
  window.removeEventListener('keydown', handleKeydown);
});

const close = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div v-if="isVisible" class="overlay-backdrop" @click.self="close">
        <div class="overlay-container">

          <button class="close-btn" @click="close" aria-label="Close">✕</button>

          <div class="overlay-layout">

            <div class="info-column custom-scroll">
              <div class="info-content" v-if="data">
                <h4>О проекте</h4>
                <h2 class="overlay-title">{{ data.headline }}</h2>
                <p class="overlay-subtitle">{{ data.secondary_text }}</p>
                <div class="overlay-text" v-if="data.description">
                  {{ data.description }}
                </div>
              </div>
            </div>

            <div class="gallery-column">

              <div
                  class="slider-stage"
                  @touchstart="handleTouchStart"
                  @touchend="handleTouchEnd"
              >
                <div v-if="!hasImages" class="empty-state">Нет изображений</div>

                <TransitionGroup :name="`slide-${slideDirection}`">
                  <div
                      v-if="hasImages"
                      :key="images[currentIndex]"
                      class="slide-image-wrapper"
                  >
                    <img :src="images[currentIndex]" alt="Project View" />
                  </div>
                </TransitionGroup>

                <template v-if="hasImages && !isSingleImage">
                  <button class="nav-btn prev" @click.stop="prevImage">❮</button>
                  <button class="nav-btn next" @click.stop="nextImage">❯</button>
                </template>
              </div>

              <div class="thumbnails-bar" v-if="hasImages && !isSingleImage">
                <div class="thumbnails-track custom-scroll-x">
                  <button
                      v-for="(img, idx) in images"
                      :key="idx"
                      class="thumb-item"
                      :class="{ active: idx === currentIndex }"
                      @click="goToImage(idx)"
                  >
                    <img :src="img" loading="lazy" alt="thumbnail" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(5px);
}

.overlay-container {
  width: 90vw; height: 90vh;
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
  display: flex; flex-direction: column;
  max-width: 200rem;
}

.close-btn {
  position: absolute; top: 1rem; right: 1rem;
  background: rgba(255,255,255,0.2);
  border: none; border-radius: 50%;
  width: 40px; height: 40px;
  cursor: pointer; z-index: 100;
  font-size: 1.2rem; color: var(--color-text-accent);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.close-btn:hover {
  background: var(--color-text-accent);
  color: var(--color-text-dark);
}

.overlay-layout {
  display: grid;
  grid-template-columns: 1fr 2fr;
  height: 100%;
  width: 100%;
}

.info-column {
  padding: 3rem 2rem;
  overflow-y: auto;
  background-color: var(--color-background-light);
  color: var(--color-text-dark);
}
.overlay-title { font-size: 5.6rem; margin: 0.5rem 0; line-height: 1.1; }
.overlay-subtitle, .overlay-text {
  opacity: 0.6;
  font-size: 1.5rem;
}
.overlay-text{
  opacity: 1;
  margin-top: 3.2rem;
}
.gallery-column {
  position: relative;
  height: 100%;
  background: rgba(20, 20, 20, 0.9);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.slider-stage {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-image-wrapper {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 20, 20, 0.9);
}

.slide-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  font-size: 2rem;
  width: 50px; height: 80px;
  cursor: pointer;
  z-index: 20;
  transition: background 0.3s;
  display: flex; align-items: center; justify-content: center;
}
.nav-btn:hover { background: rgba(0, 0, 0, 0.6); }
.nav-btn.prev { left: 0; border-radius: 0 8px 8px 0; }
.nav-btn.next { right: 0; border-radius: 8px 0 0 8px; }

.thumbnails-bar {
  height: 80px;
  background: rgba(20, 20, 20, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  z-index: 30;
}

.thumbnails-track {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 0 20px;
  max-width: 100%;
  height: 100%;
}

.thumb-item {
  height: 100%;
  aspect-ratio: 1/1;
  border: 2px solid transparent;
  border-radius: 6px;
  padding: 0;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.2s;
  background: #333;
  flex-shrink: 0;
}
.thumb-item img {
  width: 100%; height: 100%; object-fit: cover; border-radius: 4px;
}
.thumb-item:hover { opacity: 0.8; }
.thumb-item.active { opacity: 1; border-color: var(--color-accent-primary, #fff); }

.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
.custom-scroll-x::-webkit-scrollbar { height: 4px; }
.custom-scroll-x::-webkit-scrollbar-thumb { background: #555; border-radius: 2px; }

.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.3s ease; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }

.slide-next-enter-active, .slide-next-leave-active { transition: all 0.4s ease-in-out; }
.slide-next-enter-from { transform: translateX(100%); opacity: 0.8; }

.slide-next-leave-to { transform: translateX(-100%); opacity: 0.8; }

.slide-prev-enter-active, .slide-prev-leave-active { transition: all 0.4s ease-in-out; }
.slide-prev-enter-from { transform: translateX(-100%); opacity: 0.8; }

.slide-prev-leave-to { transform: translateX(100%); opacity: 0.8; }

.slide-next-leave-active, .slide-prev-leave-active { position: absolute; }

@media (max-width: 1250px) {
  .overlay-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  .info-column { order: 2; max-height: 40vh; border-top: 1px solid #eee; padding: 1.5rem; }
  .gallery-column { order: 1; height: 50vh; }

  .nav-btn { width: 40px; height: 60px; font-size: 1.5rem; opacity: 0.7; }
}
</style>