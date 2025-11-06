import { createI18n } from "vue-i18n";

const messages = {
    de: {
        nav: {
            about: "über",
            contact: "kontakt",
        },
        categories: {
            portraits: "Porträts",
            landscape: "Landschaft",
            wildlife: "Wildleben",
            dummy1: "Dummy 1",
            dummy2: "Dummy 2",
        },
    },
    en: {
        nav: {
            about: "about",
            contact: "contact",
        },
        categories: {
            portraits: "portraits",
            landscape: "landscape",
            wildlife: "wildlife",
            dummy1: "Dummy 1",
            dummy2: "Dummy 2",
        },
    },
};

export const i18n = createI18n({
    legacy: false,
    locale: "de",
    fallbackLocale: "en",
    messages,
});
