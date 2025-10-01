export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
    initialRouteName: "(forms)/index.tsx",
};

import { Stack } from "expo-router";
import { config } from "@/gluestack-ui.config";
const primary = config.tokens.colors.primary["500"];
const neutralDark = config.tokens.colors.primary["600"];
const neutralLight = config.tokens.colors.primary["700"];
const accent = config.tokens.colors.primary["800"];
const gold = config.tokens.colors.primary["900"];
export default function AppLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: neutralLight,
                },
            }}
        >
            <Stack.Screen name="(forms)" options={{ headerShown: false, contentStyle: { backgroundColor: neutralLight } }} />
        </Stack>
    );
}
