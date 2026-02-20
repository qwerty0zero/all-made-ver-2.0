<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import DefaultImg from "~/components/UI/DefaultImg.vue";
import ProjectOverlay from "./ProjectOverlay.vue";

interface ProjectData {
  headline: string;
  secondary_text: string;
  description?: string;
  extended_description?: string;
  [key: string]: any;
}

const props = withDefaults(
    defineProps<{
      data: ProjectData
      index: number
      extended?: boolean
    }>(),
    {
      extended: false,
    }
);

const isModalOpen = ref(false);

const openModal = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();

  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  document.body.style.overflow = 'hidden';
  document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  document.documentElement.style.removeProperty('--scrollbar-width');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
};

onUnmounted(() => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
});
const allProjectImages = import.meta.glob('~/assets/images/projects/**/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
});

const projectImages = computed(() => {
  const projectIdStr = `project-${props.index + 1}`;
  return Object.keys(allProjectImages)
      .filter((path) => path.includes(`/${projectIdStr}/`))
      .map((path) => allProjectImages[path] as string);
});
</script>

<template>
  <div v-if="extended" @click="openModal" class="project_card one_time_animation fade_up extended"
       :class="'grid_item-'+(index+1)"
       v-observe-visibility
       data-offset="10"
       :data-delay="100+(index*100)"
  >

    <div class="img_holder">
      <DefaultImg
          :src="'index/project_card/project_card-' + (index+1)"
          class="dark absolute project-bg-img"
          style="border-radius: 0.5rem"
      />
    </div>
    <article>
      <h3>{{ data.headline }}</h3>
      <p>{{ data.secondary_text }}</p>
    </article>
  </div>

  <a v-if="!extended" href="" @click="openModal" class="project_card one_time_animation"
     :class="'grid_item-'+(index+1)"
     v-observe-visibility
     data-offset="90"
  >
    <article>
      <h3>{{ data.headline }}</h3>
      <p>{{ data.secondary_text }}</p>
    </article>
    <DefaultImg
        :src="'index/project_card/project_card-' + (index+1)"
        class="dark absolute project-bg-img"
        style="border-radius: 0.5rem"
    />
  </a>

  <ProjectOverlay
      :is-visible="isModalOpen"
      :data="data"
      :images="projectImages"
      @close="closeModal"
  />

</template>

<style scoped>
.project_card{
  color: var(--color-text-light);
  position: relative;
  font-size: 3rem;
  font-weight: bold;
  min-height: 600px;
  padding: 2rem;
  border-radius: 0.5rem;
  transition: 0.3s;
  cursor: pointer;
}
.project_card.extended{
  color: var(--color-text-dark);
  border-radius: 0;
  padding: 0;
  padding-bottom: 2rem;
}

.img_holder{
  min-height: 600px;
  position: relative;
}

article{
  position: relative;
  z-index: 2;
}
p{
  font-size: 1.5rem;
}
.grid_item-1 {
  grid-column: span 2 / span 2;
}

.grid_item-2 {
  grid-column-start: 3;
}

.grid_item-3 {
  grid-row-start: 2;
}

.grid_item-4 {
  grid-column: span 2 / span 2;
  grid-row-start: 2;
}
.extended{
  grid-column-start: unset;
  grid-row-start: unset;
  grid-column: unset;
  display: flex;
  flex-direction: column;
  gap: 3.2rem;
}
.extended article{
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  padding:0 2rem;
}

@media screen and (max-width: 1200px) {
  .project_card{
    min-height: 400px;
  }
}
@media screen and (max-width: 900px) {
  .project_card.extended{
    gap: 1.6rem;
  }

  .img_holder{
    min-height: 400px;
  }
  .extended article{
    gap: 1rem;
  }
}
@media screen and (max-width: 760px) {
  h3{
    font-size: 2rem;
  }
  p{
    font-size: 1.2rem;
  }
}
@media screen and (max-width: 600px) {
  .grid_item-1, .grid_item-2, .grid_item-3, .grid_item-4 {
    grid-row-start: unset;
    grid-column:unset;
    grid-column-start: unset;
    min-height: 250px;
  }
}
</style>