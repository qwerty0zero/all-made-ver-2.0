import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { getUserLang } from '@/utils/getUserLang'

export default defineNuxtRouteMiddleware((to) => {
    const availableLangs = ['pl', 'rus', 'eng']
    const pathLang = to.path.split('/')[1]

    if (availableLangs.includes(pathLang)) {
        return
    }

    const detectedLang = getUserLang()

    return navigateTo(`/${detectedLang}${to.fullPath}`, { redirectCode: 302 })
})