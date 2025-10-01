import { Stack } from "expo-router";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@/gluestack-ui.config";

export default function ELayout() {
    return (
        <GluestackUIProvider config={config}>
            <Stack screenOptions={{ headerShown: false }} />
        </GluestackUIProvider>
    );
}
