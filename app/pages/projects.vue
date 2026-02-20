<script setup lang="ts">
import { useI18n } from '#imports'
const { $t } = useI18n()

import ProjectCard from "~/components/UI/ProjectCard.vue";
import SectionText from "~/components/UI/SectionText.vue";


</script>

<template>

<section >
  <SectionText :data="$t('page.main')"/>
  <div class="project_holder">
    <ProjectCard
                 v-for="(el,index) in $t('page.card')" :data="el" :index :extended="true"

    />

  </div>
</section>

</template>

<style scoped>
section {
  padding-top: 15rem;

  max-width: 200rem;
  width: 100%;
  margin: 0 auto;
}
.project_holder{
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
}
@media screen and (max-width: 1350px) {
  .project_holder{
    display: grid;
    grid-template-columns: 1fr 1fr ;
    gap: 0.5rem;
  }
}
</style>


