<script setup lang="ts">

const props = defineProps<{
  headline: String;
  isActive: boolean;
}>();

const emit = defineEmits(['select']);
</script>

<template>
  <div class="item-wrapper">
    <h3
        :class="{ active: isActive }"
        @click="emit('select')"
    >
      {{ headline }}
    </h3>
  </div>
</template>

<style scoped>
.item-wrapper{
  position: relative;
}
h3 {
  position: relative;
  font-size: 4.5rem;
  font-weight: bold;
  border-bottom: 0.2rem solid var(--color-accent-secondary);
  cursor: pointer;
  opacity: 0.5;
  transition:  0.3s ease;
  padding-bottom: 0.5rem;
  width: 100%;
}
h3::before{
  content: "";
  position: absolute;
  width: 100%;
  height: 0;
  left: 0;
  bottom: 0;
  transition:  0.3s ease;
  background-color: var(--color-background-accent);
  z-index: -1;
}
h3:hover {
  opacity: 0.8;
  color: var(--color-text-dark);
}
h3:hover::before{
  height: 100%;
}
h3.active {
  opacity: 1;
  border-bottom-color: var(--color-accent-thirdly);
}
h3.active::before, h3.active:hover::before{
  height: 0;
}
h3.active:hover{
  color:  var(--color-background-accent);
}
h3::after {
  content: '';
  position: absolute;
  bottom: -0.2rem;
  left: 0;
  height: 0.2rem;
  background-color: var(--color-accent-primary);
  width: 0%;
}

h3.active::after {
  animation: progress-bar 10s linear forwards;
}

@keyframes progress-bar {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

@media screen and (max-width: 1200px) {

  h3{
    font-size: 3.2rem;
  }
}
@media screen and (max-width: 760px) {
  h3{
    font-size: 2rem;
  }

}
</style>