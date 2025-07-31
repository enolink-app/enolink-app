import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { I18nManager } from "react-native";
import useLanguageStore from "@/stores/useLanguageStore";
import { useAuth } from "../hooks/useAuth";
import { ActivityIndicator, View, Alert } from "react-native";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@/ui/gluestack-ui.config";
export default function Index() {
    const { user, loading } = useAuth();
    const { language, setLanguage } = useLanguageStore();

    useEffect(() => {
        const defaultLanguage = "en";
        setLanguage(defaultLanguage);

        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
    }, []);
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <GluestackUIProvider config={config}>
            <Redirect href={user ? "/tabs/(tabs)/home" : "/splash"} />
        </GluestackUIProvider>
    );
}
