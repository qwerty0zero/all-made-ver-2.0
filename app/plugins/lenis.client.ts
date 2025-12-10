import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
    const router = useRouter()

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    function raf(time: number) {
        lenis.raf(time)
        requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    nuxtApp.hook('app:mounted', () => {
        document.addEventListener('click', (e) => {
            const link = (e.target as HTMLElement).closest('a')
            if (!link) return

            const href = link.getAttribute('href')

            if (href && href.startsWith('#')) {
                e.preventDefault()

                if (href === '#') {
                    lenis.scrollTo(0)
                } else {
                    const target = document.querySelector(href)
                    if (target) {
                        lenis.scrollTo(target, { offset: -50 })
                    }
                }
            }
        })
    })

    nuxtApp.hook('page:finish', () => {
        if (router.currentRoute.value.hash) {
            setTimeout(() => {
                const target = document.querySelector(router.currentRoute.value.hash)
                if (target) {
                    lenis.scrollTo(target, { offset: -50 })
                }
            }, 100)
        } else {
            lenis.scrollTo(0, { immediate: true })
        }
    })

    return {
        provide: {
            lenis
        }
    }
})