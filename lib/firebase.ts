// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence, onAuthStateChanged, User } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDtYR9RCS8kiUp1pUOWMuxHKGBF701Yriw",
    authDomain: "ivino-app.firebaseapp.com",
    projectId: "ivino-app",
    storageBucket: "ivino-app.appspot.com",
    messagingSenderId: "27430021409",
    appId: "1:27430021409:web:5dd494dff3faa3cce87660",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);

// Função para obter o token atualizado
export const getCurrentUserToken = async (): Promise<string | null> => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        const token = await user.getIdToken(true); // Força a atualização do token
        return token;
    } catch (error) {
        console.error("Erro ao obter token:", error);
        return null;
    }
};

// Listener para autenticação
export const setupAuthListener = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export const storage = getStorage(app);
