export function getUserLang(): string {
    let lang = 'pl';

    if (process.client) {
        const userLang = navigator?.language?.toLowerCase() || '';

        const cyrillicLangs = [
            'ru', 'ru-ru', 'uk', 'uk-ua', 'by', 'be', 'be-by',
            'kk', 'kk-kz', 'uz', 'uz-uz', 'kg', 'ky-kg'
        ];

        if (userLang.startsWith('pl')) {
            lang = 'pl';
        } else if (cyrillicLangs.some(code => userLang.startsWith(code))) {
            lang = 'rus';
        } else {
            lang = 'eng';
        }
    }

    return lang;
}
