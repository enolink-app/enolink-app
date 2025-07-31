import en from "../i18n/en-EN.json";
import ptBR from "../i18n/pt-BR.json";
import ptPT from "../i18n/pt-PT.json";
import esES from "../i18n/es-ES.json";
import frFR from "../i18n/fr-FR.json";
import itIT from "../i18n/it-IT.json";

// Exporte como um objeto com tipos explícitos
const translations = {
    en,
    "pt-BR": ptBR,
    "pt-PT": ptPT,
    "es-ES": esES,
    "fr-FR": frFR,
    "it-IT": itIT,
} as const;

export type TranslationKey = keyof typeof translations;
export type TranslationResources = typeof translations;

export default translations;
