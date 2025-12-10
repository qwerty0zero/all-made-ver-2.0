export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
    nitro: {
        prerender: {
            routes: ['/rus', '/eng', 'pl'],

            failOnError: false,
        }
    },
  devtools: { enabled: true },
    app: {
        head: {
            title: "All Made",
            meta: [{ name: "description", content: "Nuxt landing page" }],
            link: [
                { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
                { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon.png" },
                { rel: "apple-touch-icon", sizes: "180x180", href: "/favicon-180.png" }

            ]
        }
    },
    css: [
        "@/assets/css/main.css"
    ],
    modules: ["@nuxtjs/google-fonts"],

    googleFonts: {
        families: {
            Montserrat: [100, 200, 300, 400, 500, 600, 700, 800, 900]
        },
        display: "swap",
        preconnect: true,
        preload: true
    }
})
