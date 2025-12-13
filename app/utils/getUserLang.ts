import { useRequestHeaders } from '#app'

export function getUserLang(): string {
    // 1. Получаем "сырую" строку языка
    let userRawLang = '';

    if (process.server) {
        const headers = useRequestHeaders(['accept-language']);
        // Пробуем получить заголовок в разном регистре на всякий случай
        userRawLang = headers['accept-language'] || headers['Accept-Language'] || '';

        // --- ДЕБАГ: Посмотрите это в терминале VS Code ---
        console.log('🌍 [Server SSR] Заголовок Accept-Language:', userRawLang);
        // -----------------------------------------------
    } else {
        userRawLang = navigator?.language || '';
    }

    // 2. Очищаем строку
    // Если строка вида "ru-RU,en;q=0.9", берем только первую часть до запятой -> "ru-RU"
    // И переводим в нижний регистр
    const preferredLang = userRawLang.split(',')[0].trim().toLowerCase();

    // 3. Списки языков (упростим коды, так как мы проверяем .startsWith)
    // Достаточно указать 'ru', это покроет и 'ru', и 'ru-ru', и 'ru-by'
    const cyrillicLangs = ['ru', 'uk', 'by', 'be', 'kk', 'uz', 'kg', 'ky'];

    // 4. Логика определения
    if (preferredLang.startsWith('pl')) {
        return 'pl';
    }

    // Проверяем, начинается ли preferredLang с любого из кодов кириллицы
    const isCyrillic = cyrillicLangs.some(code => preferredLang.startsWith(code));

    if (isCyrillic) {
        return 'rus';
    }

    // 5. Fallback
    // Если язык не польский и не кириллица — отдаем английский
    return 'pl';
}