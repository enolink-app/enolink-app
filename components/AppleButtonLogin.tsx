import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import { signInWithCredential, OAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AppleLoginButton() {
    const handleAppleLogin = async () => {
        try {
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });

            if (!appleAuthRequestResponse.identityToken) {
                throw new Error("Apple Sign-In failed - no identify token returned");
            }

            const { identityToken, nonce } = appleAuthRequestResponse;
            const provider = new OAuthProvider("apple.com");
            const credential = provider.credential({
                idToken: identityToken,
                rawNonce: nonce,
            });

            const userCredential = await signInWithCredential(auth, credential);
            console.log("Usuário Apple logado:", userCredential.user);
        } catch (error) {
            console.error("Erro no login com Apple:", error);
        }
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handleAppleLogin}>
            <Text style={styles.text}>Continuar com Apple</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#000",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginVertical: 10,
        width: "100%",
    },
    text: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
