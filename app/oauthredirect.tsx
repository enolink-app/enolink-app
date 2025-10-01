import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { config } from "@/gluestack-ui.config";
WebBrowser.maybeCompleteAuthSession();

const primary = config.tokens.colors.primary["500"];
const neutralDark = config.tokens.colors.primary["600"];
const neutralLight = config.tokens.colors.primary["700"];
const accent = config.tokens.colors.primary["800"];
const gold = config.tokens.colors.primary["900"];
export default function OAuthRedirectScreen() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        WebBrowser.maybeCompleteAuthSession();
    }, []);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={primary} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: neutralLight },
});
