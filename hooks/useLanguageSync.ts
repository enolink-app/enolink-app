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
                    const userRef = doc(db, "users", user.uid);

                    const userSnapshot = await getDoc(userRef);

                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.data();

                        if (userData?.language) {
                            useLanguageStore.getState().setLanguage(userData.language);
                        } else {
                            console.log("No language preference found, using default");
                            useLanguageStore.getState().setLanguage("pt-BR");
                        }
                    } else {
                        console.log("No user document found");
                        useLanguageStore.getState().setLanguage("pt-BR");
                    }
                } catch (error) {
                    console.error("Failed to fetch user language:", error);
                    useLanguageStore.getState().setLanguage("pt-BR");
                }
            } else {
                console.log("No user logged in, using default language");
                useLanguageStore.getState().setLanguage("pt-BR");
            }
        });

        return () => unsubscribe();
    }, []);
};
