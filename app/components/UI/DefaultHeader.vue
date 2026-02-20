<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from 'vue';
import { useI18n } from '#imports'
const { $t } = useI18n()

const isMenuOpen = ref(false);
const isScrolled = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <header>
    <div class="title_holder">
      <img src="/favicon.svg" alt="logo">
      <i18n-link to="/">
        <h1>{{ $t('header.title') }}</h1>
      </i18n-link>
      <div class="curve">
        <div class="square"></div>
      </div>
      <div class="curve reverse">
        <div class="square"></div>
      </div>
    </div>

    <nav :class="{ Active: isScrolled }">
      <ul class="button-list desktop-only">
        <li v-for="(el, index) in $t('header.buttons')" :key="index">
          <i18n-link v-if="el.type === 'page'" :to="el.link" class="button-link">
            {{ el.text }}
          </i18n-link>
          <a v-else :href="el.link" class="button-link">{{ el.text }}</a>
        </li>
      </ul>

      <button class="burger-btn mobile-only" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <Transition name="mobile-menu">
        <ul v-if="isMenuOpen" class="mobile-menu-list">
          <li v-for="(el, index) in $t('header.buttons')" :key="index">
            <i18n-link v-if="el.type === 'page'" :to="el.link" class="button-link">
              {{ el.text }}
            </i18n-link>
            <a v-else :href="el.link" class="button-link">{{ el.text }}</a>
          </li>
        </ul>
      </Transition>
    </nav>
  </header>
</template>

<style scoped>
header {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  padding: 2rem 4rem 0 0;
  z-index: 100;
  align-items: center;
  padding-right: var(--scrollbar-width, 0px);
}

nav {
  position: fixed;
  right: 4rem;
  transition: all 0.3s ease;
  padding: 1rem;
  border-radius: 1rem;

}

nav.Active {
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}
nav.Active a{
  font-size: 2rem;

}
ul {
  display: flex;
  align-items: center;
  padding-top: 1rem;
  list-style: none;
}

h1 {
  font-size: 5rem;
  padding: 1rem 0;
  text-wrap: nowrap;
}

img {
  height: 6em;
}

a {
  padding: 1rem 2rem;
  font-size: 2.5rem;
  display: inline-block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
  color: inherit;
}

.title_holder {
  background: var(--color-background-light);
  padding: 0 2rem;
  border-radius: 0 0 2rem 0;
  position: relative;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.curve {
  border-radius: 0;
  width: 2rem;
  height: 2rem;
  position: absolute;
  inset: 0rem -2rem auto auto;
  overflow: hidden;
}

.curve.reverse {
  z-index: auto;
  inset: auto auto -2rem 2rem;
}

.square {
  box-shadow: 0 2px 0 20rem var(--color-background-light);
  opacity: 1;
  border-radius: 2rem 0 0;
  width: 4rem;
  height: 4rem;
  position: absolute;
  inset: 0% auto auto 0%;
}

.desktop-only li:last-child a {
  background: var(--color-background-light);
  border-radius: 5rem;
  transition: 0.3s;
}
nav.Active .desktop-only li:last-child a{
  background: transparent;
}
.mobile-only {
  display: none;
}
.mobile-menu-list {
  display: none;
}

@media screen and (max-width: 1400px) {
  h1 { font-size: 4rem; }
  img { height: 5rem; }
  a { font-size: 2rem; }
}

@media screen and (max-width: 1200px) {
  nav {
    position: fixed;
    right: 4rem;
    padding: 0 ;
  }
  a{
    font-size: 2rem;
  }
  nav.Active {
    background-color: transparent;
    backdrop-filter: unset;
  }
  .desktop-only { display: none; }

  .burger-btn.mobile-only {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);

    padding: 1rem;
    border-radius: 1rem;
    height: 5rem;
    border: none;
    cursor: pointer;
    z-index: 101;
  }

  .burger-btn span {
    height: 0.4rem;
    width: 3rem;
    background-color: var(--color-background-dark);
    border-radius: 10px;
  }

  .mobile-menu-list {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: calc(100% + 2rem);
    right: 0;
    background: var(--color-background-light);
    border-radius: 1rem;
    box-shadow: 0 10px 15px rgba(0,0,0,0.1);
    align-items: flex-start;

    overflow: hidden;
    width: 20rem;
    padding: 4rem;
    transform-origin: top right;
  }

  .mobile-menu-list a {
    font-size: 1.5rem;
    padding: 0.5rem 0;
    width: 100%;
  }

  .mobile-menu-list li:last-child a {
    background: transparent;
    border-radius: 0;
  }


  .mobile-menu-enter-active {
    animation: slow-box-sequence 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  }

  .mobile-menu-enter-active a {
    animation: slow-text-fade 0.5s 0.9s ease-out forwards;
    opacity: 0;
  }

  .mobile-menu-leave-active {
    animation: slow-box-sequence 1.0s cubic-bezier(0.25, 1, 0.5, 1) reverse forwards;
  }

  .mobile-menu-leave-active a {
    animation: slow-text-fade 0.3s reverse forwards;
  }


  @keyframes slow-box-sequence {
    0% {
      width: 3rem;
      max-height: 0;
      padding: 0;
      opacity: 0;
    }
    1% {
      opacity: 1;
    }
    45% {
      width: 3rem;
      max-height: 40rem;
      padding: 4rem 0.5rem;
    }
    100% {
      width: 20rem;
      max-height: 40rem;
      padding: 4rem;
    }
  }

  @keyframes slow-text-fade {
    0% { opacity: 0; transform: translateX(10px); }
    100% { opacity: 1; transform: translateX(0); }
  }
}

@media screen and (max-width: 1000px) {
  header { padding: 1rem 4rem 0 0; }
  .curve.reverse { inset: auto auto -2rem 1rem; }
  nav[data-v-1bacb6a8] {
    right: 2rem;
  }
}

@media screen and (max-width: 760px) {
  .title_holder{
    gap: 1rem;
  }
  h1{
    font-size: 2.5rem;
  }
  img{
    height: 4rem;
  }
  nav{
    top: 2rem;
    right: 2rem;
  }
}

</style>