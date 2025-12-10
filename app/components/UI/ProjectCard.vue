<script setup lang="ts">
import DefaultImg from "~/components/UI/DefaultImg.vue";


const props = defineProps<{
  data: {},
  index: number
}>()

</script>

<template>
  <a href="" class="project_card one_time_animation"
     v-observe-visibility
     data-offset="90"

  >
    <article>
      <h3>{{props.data.headline}}</h3>
      <p>{{props.data.secondary_text}}</p>
    </article>
    <DefaultImg :src="'index/project_card/project_card-' + (index+1)" class="dark absolute" style="border-radius: 0.5rem"/>
  </a>

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

@media screen and (max-width: 1200px) {
  .project_card{
    min-height: 400px;
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