<script setup lang="ts">
import DefaultImg from "~/components/UI/DefaultImg.vue";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
});
</script>

<template>
  <section id="main">
    <DefaultImg src="index/main" class="absolute dark" style="border-radius: 2rem"/>

    <div>
      <div class="mask-container">
      <h2  v-if="props.data.headline"
          class="one_time_animation cubic_fade"
          v-observe-visibility
      >        {{ props.data.headline }}
      </h2></div>




        <div class="mask-container">
          <div class="button-mask-wrapper cubic_fade one_time_animation" v-if="props.data.button"
               v-observe-visibility
          >
            <a :href="props.data.button.link || '#contact'" ref="buttonRef">
              {{ props.data.button.title }}
            </a>
          </div>
        </div>

    </div>
  </section>
</template>

<style scoped>
:deep(.line-mask) {
  overflow: hidden;
  padding-bottom: 0.2em;
}

.button-mask-wrapper {
  overflow: hidden;

  width: fit-content;

  padding: 2px;
  margin: -2px;
}

section {
  width: 100%;
  height: 100dvh;
  position: relative;
  border: 2rem solid var(--color-background-light);
  transition: 0.3s;
  padding: 10rem 4rem;
  border-radius: 4rem;
  display: flex;
  justify-content: center;
}

section > div {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: var(--color-text-light);
  font-size: 4rem;
  z-index: 2;
}

a {
  font-size: 2rem;
  padding: 2rem 6rem;
  display: block;
  text-transform: uppercase;
  font-weight: bold;
  border-radius: 1rem;
  color: var(--color-text-dark);
  background-color: var(--color-background-accent);
  border: 1px solid var(--color-background-accent);
  text-decoration: none;
}

@media screen and (max-width: 1200px) {
  h2 { font-size: 3.2rem; }
  a { font-size: 2rem; padding: 1.5rem 3rem; }
}

@media screen and (max-width: 1000px) {
  section {
    border: 1rem solid var(--color-background-light);
    border-radius: 2rem;
    padding: 10rem 3rem;
  }
}
@media screen and (max-width: 600px) {
  section {
    padding: 0 1rem  ;
  }
}
</style>