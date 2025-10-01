import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en-EN.json";
import ptBR from "./pt-BR.json";
import ptPT from "./pt-PT.json";
import esES from "./es-ES.json";
import frFR from "./fr-FR.json";
import itIT from "./it-IT.json";

i18n.use(initReactI18next).init({
    fallbackLng: "pt-BR",
    resources: {
        ptBR: { translation: ptBR },
        en: { translation: en },
        es: { translation: esES },
        fr: { translation: frFR },
        it: { translation: itIT },
        ptPT: { translation: ptPT },
    },
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
