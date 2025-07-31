export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: "(tabs)/home.tsx",
};
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@/gluestack-ui.config"; // Caminho ajustado ao seu projeto
import { Slot } from "expo-router";
import { Stack } from "expo-router";

export default function AppLayout() {
    console.log("🌈 Tema carregado com primary500 no layout TABS:", config.tokens.colors.primary?.["500"]);
    return (
        <GluestackUIProvider config={config}>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </GluestackUIProvider>
    );
}
