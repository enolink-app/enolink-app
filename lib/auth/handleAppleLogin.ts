import * as AppleAuthentication from "expo-apple-authentication";
import { auth } from "../firebase";
import { OAuthProvider, signInWithCredential } from "firebase/auth";
import { createUserInFirestore } from "./createUserInFirestore";
import { Alert } from "react-native";

export const handleAppleLogin = async () => {
    try {
        const appleCredential = await AppleAuthentication.signInAsync({
            requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL, AppleAuthentication.AppleAuthenticationScope.FULL_NAME],
        });

        if (!appleCredential.identityToken) {
            throw new Error("Token da Apple ausente.");
        }

        const provider = new OAuthProvider("apple.com");
        const credential = provider.credential({
            idToken: appleCredential.identityToken,
        });

        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;

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
