// stores/useLanguageStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import translations from "../translations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Translations = typeof translations;
type LanguageCode = keyof Translations;

interface LanguageState {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: (key: string) => string;
    initialize: () => Promise<void>;
    syncLanguageWithFirebase: (userId: string) => Promise<void>;
}

const useLanguageStore = create<LanguageState>()(
    persist(
        (set, get) => ({
            language: "en",
            setLanguage: (lang) => {
                set({ language: lang });
                // Sincroniza com Firebase se usuário logado
                const user = auth.currentUser;
                if (user) {
                    get().syncLanguageWithFirebase(user.uid);
                }
            },
            t: (key) => {
                const { language } = get();
                const keys = key.split(".");
                let value: any = translations[language];

                for (const k of keys) {
                    value = value?.[k];
                    if (value === undefined) break;
                }

                return value ?? `[${key}]`;
            },
            initialize: async () => {
                // Pode adicionar lógica para detectar idioma do dispositivo aqui
            },
            syncLanguageWithFirebase: async (userId) => {
                try {
                    const userRef = doc(db, "users", userId);
                    await setDoc(userRef, { language: get().language }, { merge: true });
                } catch (error) {
                    console.error("Failed to sync language with Firebase:", error);
                }
            },
        }),
        {
            name: "language-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export default useLanguageStore;
