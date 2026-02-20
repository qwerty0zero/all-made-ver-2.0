<script setup lang="ts">

const props = defineProps<{
  data: DataProps;
  index: number;
}>();
const getClassByIndex = (index: number) => {
  return `index_${index+1}`;
};
</script>

<template>
  <div class="card" :class="getClassByIndex(props.index)">
    <p class="card_index">.0{{index+1}}</p>
    <img :src="'/images/gliph/'+(index+1)+'.svg'" alt="">
    <div class="card_text">
      <h3>{{props.data.headline}}</h3>
      <p>{{props.data.secondary_text}}</p>
    </div>
  </div>

</template>

<style scoped>
.card,.card_text{
  display: flex;
  flex-direction: column;
  color: var(--color-text-light);
}
.card{
  gap: 5rem;
  padding: 2rem 4rem;
  border-radius: 0.5rem;
}
.card_text{
  gap: 2rem;
}
h3{
  font-size: 3rem;
  font-weight: bold;
}
p{
  font-size: 1.5rem;
  font-weight: bold;

}
.card_index{
   align-self: end;
 }
img {
  height: 15rem;
  width: fit-content;
  transition: 0.5s;
}
.index_1{
  background-color: var(--color-accent-primary);
}
.index_2{
  background-color: var(--color-accent-secondary);
}
.index_3{
  background-color: var(--color-accent-thirdly);
}

@media screen and (max-width: 1200px) {
  h3{
    font-size: 2.5rem;
  }
}
@media screen and (max-width: 850px) {
  img{
    height: 10rem;
  }
}
@media screen and (max-width: 760px) {
  img {
    top: 0;
    left: 0;
    width: 100%;
    position: absolute;
    height: 100%;
    z-index: 0;
    transform: rotate(45deg) scale(1.3);
    opacity: 0.2;

  }
  .card {
    gap: 2rem;
    transition-delay: 100ms;
    position: relative;
    overflow: hidden;
  }
  .card>p, .card>div{
    position:  relative;
  }
}
@media screen and (max-width: 500px) {
  .card{
    padding: 2rem;
    gap: 1rem;
  }
  h3{
    font-size: 2rem;
  }
  p{
    font-size: 1.4rem;
  }
}
</style>