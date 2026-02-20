<script setup lang="ts">

import SectionText from "~/components/UI/SectionText.vue";
import DefaultImg from "~/components/UI/DefaultImg.vue";
import ServiceCard from "~/components/UI/ServiceCard.vue";
</script>

<template>
  <section id="about_us">
    <SectionText :data="$t('page.about_us')" type="secondary"/>
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

  <section id="about_us_2">

    <div class="mask-container-img">

      <DefaultImg src="/index/about_us_card_2/about_us-2"
                  v-observe-visibility
                  data-offset="20"
                  class="one_time_animation img"/>
    </div>

    <SectionText :data="$t('page.about_us_2')" type="secondary"/>
  </section>

  <section id="services">
    <SectionText :data="$t('page.services')" />
    <div class="cards" >
      <ServiceCard  v-for="(el, index) in $t('page.services.card')" :data="el" :key="index" :index
                    v-observe-visibility
                    data-offset="10"

                    :data-delay="100+(index*100)"

      />

    </div>
  </section>
</template>

<style scoped>

</style>