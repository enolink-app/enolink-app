import { Slot } from "expo-router";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@/gluestack-ui.config";
import Watermark from "@/components/Watermark";
import { useLanguageSync } from "@/hooks/useLanguageSync";
export default function RootLayout() {
    useLanguageSync();
    return (
        <GluestackUIProvider config={config}>
            <Slot />
            <Watermark />
        </GluestackUIProvider>
    );
}
