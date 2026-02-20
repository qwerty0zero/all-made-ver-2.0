import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig> {
    scrollBehavior(to, from, savedPosition) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (to.hash) {
                    resolve({ el: to.hash, behavior: 'smooth', top: 50 })
                } else {
                    resolve({ top: 0 })
                }
            }, 500)
        })
    }
}