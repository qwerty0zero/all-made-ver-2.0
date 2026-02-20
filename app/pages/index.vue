<script setup lang="ts">
import { useRoute } from '#app';
import { useI18n } from '#imports'
const { $t } = useI18n()

import SectionText from "~/components/UI/SectionText.vue";
import ServiceCard from "~/components/UI/ServiceCard.vue";
import DefaultImg from "~/components/UI/DefaultImg.vue";
import ProjectCard from "~/components/UI/ProjectCard.vue";


</script>

<template>

  <main>
    <MainSection :data="$t('page.main')"/>
    <section id="about_us">
      <SectionText :data="$t('page.about_us')"/>
      <div class="cards">
        <div class="card one_time_animation fade_up" v-for="(el,index) in $t('page.about_us.card')"
             v-observe-visibility
             data-offset="30"
             :data-delay="100+(index*200)"
        >
          <DefaultImg class="dark" :src="'index/about_us_card/about_us_card-'+(index+1)"/>
          <p>
            {{el}}
          </p>
        </div>
      </div>
    </section>
    <TimeLineSection :data="$t('page.steps')"/>
    <section id="about_us_2">

      <div class="mask-container-img">

        <DefaultImg src="/index/about_us_card_2/about_us-2"
                    v-observe-visibility
                    data-offset="20"
                    class="one_time_animation img"/>
      </div>

      <SectionText :data="$t('page.about_us_2')"/>
    </section>
    <section id="services">
      <SectionText :data="$t('page.services')"/>
      <div class="cards" >
        <ServiceCard  v-for="(el, index) in $t('page.services.card')" :data="el" :key="index" :index
                      v-observe-visibility
                      data-offset="10"

                      :data-delay="100+(index*100)"

        />

      </div>
    </section>
    <section id="faq">
      <SectionText :data="$t('page.faq')"/>
      <FaqContainer :data="$t('page.faq.item')"/>
    </section>
    <section id="our_works">
      <SectionText :data="$t('page.projects')"/>
      <div class="project_grid_container">
        <ProjectCard v-for="(el, index) in $t('page.projects.card')" :key="index" :data="el" :index
        />
      </div>
    </section>
  </main>

</template>

<style scoped>


.project_grid_container{
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
}

</style>