<script setup lang="ts">
const headerData = inject('headerData');
const footerData = inject('footerData');

</script>

<template>
<footer id="contact">
  <div class="content one_time_animation"
       v-observe-visibility
       data-offset="90">

    <nav class="menu">
      <ul>
        <li v-for="el in headerData.buttons">
          <a :href="el.link">{{ el.text }}</a>
        </li>
      </ul>
    </nav>
    <ul class="social">
      <li v-for="el in footerData.links">
        <a :href="el.link" target="_blank">{{el.text}}</a>
      </li>
    </ul>
    <ul>
      <li>
        <a :href="'mailto:'+ footerData.mail">{{footerData.mail}}</a>
      </li>
      <li>
        <a :href="'tel:'+footerData.tel">{{footerData.tel}}</a>
      </li>
    </ul>
  </div>
  <div class="mask-container">
    <h4 class="one_time_animation cubic_fade"
        v-observe-visibility
        data-offset="0"
        data-delay="100"
    >
      ALL MADE
    </h4>
  </div>

</footer>
</template>

<style scoped>
footer {
  background-color: var(--color-background-dark);
  color: var(--color-text-light);
  font-size: 2rem;
  font-weight:bold;
  position: relative;
  border: 2rem solid var(--color-background-light);
  border-radius: 4rem;

  padding:  10rem 6rem 0 6rem;

}
.content {
  justify-content: end;
  align-items: flex-start;
}
.content,  nav, ul{
  display: flex;
  gap: 4rem;
}
nav, ul{
  flex-direction: column;
  gap: 1rem;
}
.social, .menu{
  text-transform: uppercase;
}
h4{
  color: var(--color-text-accent);
  font-size: 15cqi;
  text-align: center;
  margin-top: 10rem ;
}
a{
  font-weight: bold;
}
@media screen and (max-width: 1200px) {
  footer{
    font-size: 1.5rem;
  }
}

@media screen and (max-width: 1000px) {
  footer{
    border: 1rem solid var(--color-background-light);
    border-radius: 2rem;

    padding:  10rem 3rem 0 3rem;
  }
}
@media screen and (max-width: 760px) {
  footer {
    font-size: 1.2rem;
    padding: 6rem 3rem 0 3rem;
  }
}
@media screen and (max-width: 600px) {
  footer {
    padding: 3rem 1rem 0 1rem;
  }
  .content {
    gap: 2rem;
    flex-direction: column;
  }
  nav, ul {
    gap: 0.5rem;
  }
  h4{
    margin-top: 3rem;
  }
}
</style>