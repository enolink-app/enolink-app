import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import { signInWithCredential, OAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "expo-router";
import { AppleIcon } from "lucide-react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import useLanguageStore from "@/stores/useLanguageStore";

export default function AppleLoginButton() {
    const router = useRouter();
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

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

            router.push("/tabs/(tabs)/home");
        } catch (error) {
            console.error("Erro no login com Apple:", error);
        }
    };

    return (
        <TouchableOpacity key={updateKey} style={styles.button} onPress={handleAppleLogin}>
            <AntDesign name="apple1" size={20} color="white" style={{ marginRight: 12 }} />
            <Text style={styles.text}>{t("login.signIn")} Apple</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        justifyContent: "center",
        flexDirection: "row",
        backgroundColor: "#000",
        padding: 15,
        borderRadius: 100,
        alignItems: "center",
        marginVertical: 10,
        width: "100%",
        height: 70,
    },
    text: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});
