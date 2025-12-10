<script setup lang="ts">
import { inject } from 'vue';
import { useRoute } from '#app';

const route = useRoute();
const lang = inject('lang');
const indexData = inject('indexData');

import metaPl from '@/assets/json/pl/meta.json';
import metaRus from '@/assets/json/rus/meta.json';
import metaEng from '@/assets/json/eng/meta.json';
import DefaultHeader from "~/components/UI/DefaultHeader.vue";
import SectionText from "~/components/UI/SectionText.vue";
import ServiceCard from "~/components/UI/ServiceCard.vue";
import DefaultImg from "~/components/UI/DefaultImg.vue";
import ProjectCard from "~/components/UI/ProjectCard.vue";
import DefaultFooter from "~/components/UI/DefaultFooter.vue";

const metaMap = {
  pl: metaPl,
  rus: metaRus,
  eng: metaEng
};

const metaData = metaMap[lang]?.index || metaPl.index;

useHead({
  title: metaData.title,
  meta: [
    { name: 'description', content: metaData.description },
  ]
});


</script>

<template>
  <DefaultHeader/>

  <main>
    <MainSection :data="indexData.main"/>
    <section id="about_us">
      <SectionText :data="indexData.about_us"/>
      <div class="cards">
        <div class="card one_time_animation fade_up" v-for="(el,index) in indexData.about_us.card"
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
    <TimeLineSection :data="indexData.steps"/>
    <section id="about_us_2">
      <div class="mask-container-img">

        <DefaultImg src="/index/about_us_card_2/about_us-2"
                    v-observe-visibility
                    data-offset="20"
                    class="one_time_animation img"/>
      </div>

      <SectionText :data="indexData.about_us_2"/>
    </section>
    <section id="services">
      <SectionText :data="indexData.services"/>
      <div class="cards" >
        <ServiceCard  v-for="(el, index) in indexData.services.card" :data="el" :key="index" :index
                      v-observe-visibility
                      data-offset="10"

                      :data-delay="100+(index*100)"

        />

      </div>
    </section>
    <section id="faq">
      <SectionText :data="indexData.faq"/>
      <FaqContainer :data="indexData.faq.item"/>
    </section>
    <section id="our_works">
      <SectionText :data="indexData.projects"/>
      <div class="project_grid_container">
        <ProjectCard v-for="(el, index) in indexData.projects.card" :key="index" :data="el" :index :class="'grid_item-'+(index+1)"
        />
      </div>
    </section>
  </main>

  <DefaultFooter/>
</template>

<style scoped>
section{
display: flex;
flex-direction: column;
  gap: 4rem;
}
#about_us_2, #faq{
  background-color: var(--color-background-dark);
  color: var(--color-text-accent);
}

#about_us_2 ::selection, #faq ::selection, footer ::selection{
  color: var(--color-text-dark);
  background: var(--color-background-accent);
}
.cards{
  display: flex;
  gap: 2rem;
  width: 100%;
}

#about_us .card{
  flex: 1 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  text-align: left;
  font-weight: 700;
  font-size: 1.4rem;
  text-transform: capitalize;
}
#about_us .card picture{
  border-radius: 0.5rem;
  max-height: 400px;
  height: 100%;
  min-height: 300px;
}

#about_us_2{
  flex-direction: row;
  align-items: stretch;
}
#about_us_2 picture{
  height: unset;
  min-width: 600px;
  border-radius: 0.5rem;
}

.project_grid_container{
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
}
@media screen and (max-width: 1700px) {
  #about_us_2{
    flex-direction: column-reverse;
  }
}
@media screen and (max-width: 1400px) {
  #services .cards{
    flex-direction: column;
  }
}
@media screen and (max-width: 1200px) {
  #services .cards{
    flex-direction: column;
  }
}


@media screen and (max-width: 850px) {
  #about_us .cards{
    flex-direction: column;
  }
  #about_us .card picture {
    max-height: unset;
    height: 300px;
    min-height: 300px;
  }
  #about_us_2 picture{
    min-width: unset;
  }
}
@media screen and (max-width: 600px) {
  .project_grid_container {
    display: flex;
    flex-direction: column;

  }
}
</style>