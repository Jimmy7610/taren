export function t(lang, key, dict) {
    const keys = key.split('.');
    let result = dict[lang];
    for (const k of keys) {
        if (result && result[k]) {
            result = result[k];
        } else {
            return key;
        }
    }
    return result;
}
