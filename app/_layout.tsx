import { Slot, useRouter, useSegments } from "expo-router";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@/gluestack-ui.config";
import Watermark from "@/components/Watermark";
import { useLanguageSync } from "@/hooks/useLanguageSync";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Linking } from "react-native";

export default function RootLayout() {
    useLanguageSync();
    const router = useRouter();
    const segments = useSegments();
    const { user, loading } = useAuth();

    useEffect(() => {
        const handleDeepLink = (event: { url: string }) => {
            const url = event.url;

            if (url.includes("/e/join/")) {
                const eventId = url.split("/e/join/")[1];

                if (eventId) {
                    router.replace(`/e/join/${eventId}`);
                }
            }
        };

        const subscription = Linking.addEventListener("url", handleDeepLink);

        Linking.getInitialURL().then((url) => {
            if (url) {
                handleDeepLink({ url });
            }
        });

        return () => {
            subscription.remove();
        };
    }, [router]);

    return (
        <GluestackUIProvider config={config}>
            <Slot />
            <Watermark />
        </GluestackUIProvider>
    );
}
