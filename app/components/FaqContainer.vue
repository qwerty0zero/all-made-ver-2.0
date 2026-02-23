<script setup lang="ts">
import { computed } from 'vue';
import FaqItem from "~/components/UI/FaqItem.vue";
import { useCarousel } from "~/composables/useCarousel";

interface FaqData {
  headline: string;
  description: string;
}

const props = defineProps<{
  data: FaqData[];
}>();

const { activeIndex, setActive } = useCarousel(() => props.data || [], 10000);

const currentDescription = computed(() => {
  return props.data[activeIndex.value]?.description || '';
});
</script>

<template>
  <div class="faq-container">
    <div class="questions">
      <FaqItem
          v-for="(el, index) in data"
          :key="index"
          :headline="el.headline"
          :is-active="index === activeIndex"
          @select="setActive(index)"
      />
    </div>

    <div class="answer">
      <Transition name="fade" mode="out-in">
        <p :key="activeIndex">{{ currentDescription }}</p>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.faq-container {
  display: flex;
  gap: 8rem;
  align-items: center;
}
.questions, .answer {
  width: 50%;
  display: flex;
  flex-direction: column;
}
.questions{
  gap: 2rem;
}

.answer{
  font-size: 3rem;
  justify-content: center;
}p{
   white-space: pre-wrap
 }
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media screen and (max-width: 1200px) {
  .faq-container{
    flex-direction: column;
    gap: 2rem;
  }
  .questions, .answer {
    width: 100%;
  }
  .answer{
    font-size: 2rem;
  }
}
@media screen and (max-width: 760px) {
  .answer{
    font-size: 1.4rem;
  }
}
</style>