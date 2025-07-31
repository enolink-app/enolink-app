// hooks/useLanguageSync.ts
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import useLanguageStore from "@/stores/useLanguageStore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useLanguageSync = () => {
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    // Buscar preferência de idioma do Firebase
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        if (userData?.language) {
                            useLanguageStore.getState().setLanguage(userData.language);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch user language:", error);
                }
            }
        });

        return unsubscribe;
    }, []);
};
