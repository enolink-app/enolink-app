import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { I18nManager } from "react-native";
import useLanguageStore from "@/stores/useLanguageStore";
import { useAuth } from "../hooks/useAuth";
import { ActivityIndicator, View } from "react-native";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@/ui/gluestack-ui.config";
import { app } from "@/lib/firebase";
import { checkFirstLaunch } from "@/utils/firstLaunch";
import LanguageProvider from "@/components/LanguageProvider";

export default function Index() {
    const { user, loading } = useAuth();
    const { language, setLanguage, forceUpdate } = useLanguageStore();
    const [firstLaunch, setFirstLaunch] = useState<boolean | null>(null);

    useEffect(() => {
        const defaultLanguage = "pt-BR";
        setLanguage(defaultLanguage);

        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);

        checkFirstLaunch().then(setFirstLaunch);
    }, []);

    if (loading || firstLaunch === null) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <GluestackUIProvider config={config}>
            <LanguageProvider>{firstLaunch ? <Redirect href="/onboarding" /> : <Redirect href={user ? "/tabs/(tabs)/home" : "/splash"} />}</LanguageProvider>
        </GluestackUIProvider>
    );
}
