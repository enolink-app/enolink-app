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
    setLanguage: (lang: LanguageCode) => Promise<void>;
    t: (key: string) => string;
    initialize: () => Promise<void>;
    syncLanguageWithFirebase: (userId: string) => Promise<void>;
    forceUpdate: number;
    triggerUpdate: () => void;
}

const useLanguageStore = create<LanguageState>()(
    persist(
        (set, get) => ({
            language: "pt-BR",
            forceUpdate: 0,

            setLanguage: async (lang) => {
                set({ language: lang });

                get().triggerUpdate();

                const user = auth.currentUser;
                if (user) {
                    await get().syncLanguageWithFirebase(user.uid);
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
                const user = auth.currentUser;
                if (user) {
                    try {
                        const userRef = doc(db, "users", user.uid);
                        const userDoc = await getDoc(userRef);

                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            if (userData.language && userData.language !== get().language) {
                                set({ language: userData.language });
                                get().triggerUpdate();
                            }
                        }
                    } catch (error) {
                        console.error("Failed to load language from Firebase:", error);
                    }
                }
            },

            syncLanguageWithFirebase: async (userId) => {
                try {
                    const userRef = doc(db, "users", userId);
                    await setDoc(userRef, { language: get().language }, { merge: true });
                } catch (error) {
                    console.error("Failed to sync language with Firebase:", error);
                }
            },

            triggerUpdate: () => {
                set((state) => ({ forceUpdate: state.forceUpdate + 1 }));
            },
        }),
        {
            name: "language-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export default useLanguageStore;
