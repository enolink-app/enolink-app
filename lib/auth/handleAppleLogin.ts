import * as AppleAuthentication from "expo-apple-authentication";
import { auth } from "../firebase";
import { OAuthProvider, signInWithCredential } from "firebase/auth";
import { createUserInFirestore } from "./createUserInFirestore";
import { Alert } from "react-native";

export const handleAppleLogin = async () => {
    try {
        // Passo 1: Autenticação com a Apple
        const appleCredential = await AppleAuthentication.signInAsync({
            requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL, AppleAuthentication.AppleAuthenticationScope.FULL_NAME],
        });

        if (!appleCredential.identityToken) {
            throw new Error("Token da Apple ausente.");
        }

        // Passo 2: Criar credencial do Firebase
        const provider = new OAuthProvider("apple.com");
        const credential = provider.credential({
            idToken: appleCredential.identityToken,
        });

        // Passo 3: Autenticar no Firebase
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;

        // Passo 4: Registrar no Firestore (se for um novo usuário)
        if (userCredential._tokenResponse?.isNewUser) {
            await createUserInFirestore({
                uid: user.uid,
                name: appleCredential.fullName?.givenName || "Usuário Apple",
                email: user.email || "",
                provider: "apple",
                language: "pt-BR",
            });
        }

        return { success: true, user };
    } catch (error) {
        console.error("Erro no login com Apple:", error);
        return { success: false, error };
    }
};
