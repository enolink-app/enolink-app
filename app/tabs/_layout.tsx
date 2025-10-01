export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
    initialRouteName: "(tabs)/home.tsx",
};
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@/gluestack-ui.config";
import { Slot } from "expo-router";
import { Stack } from "expo-router";

const primary = config.tokens.colors.primary["500"];
const neutralDark = config.tokens.colors.primary["600"];
const neutralLight = config.tokens.colors.primary["700"];
const accent = config.tokens.colors.primary["800"];
const gold = config.tokens.colors.primary["900"];
export default function AppLayout() {
    return (
        <GluestackUIProvider config={config}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: neutralLight,
                    },
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false, headerStyle: { backgroundColor: primary } }} />
            </Stack>
        </GluestackUIProvider>
    );
}
