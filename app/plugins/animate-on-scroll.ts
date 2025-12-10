export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('observe-visibility', {
        mounted(el: HTMLElement) {
            if (!window.IntersectionObserver) return;

            setTimeout(() => {
                const offsetValue = el.dataset.offset || '0';
                const delayValue = el.dataset.delay;

                if (delayValue) {
                    el.style.transitionDelay = /^\d+$/.test(delayValue)
                        ? `${delayValue}ms`
                        : delayValue;
                }

                const rootMargin = `0px 0px -${offsetValue}% 0px`;

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            el.classList.add('active');
                            observer.unobserve(el);
                        }
                    });
                }, {
                    threshold: 0.01,
                    rootMargin: rootMargin
                });

                observer.observe(el);
                (el as any)._observer = observer;

            }, 100);
        },

        unmounted(el: HTMLElement) {
            if ((el as any)._observer) {
                (el as any)._observer.disconnect();
            }
        },

        getSSRProps() {
            return {};
        }
    });
});