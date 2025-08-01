import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Alert } from "react-native";

export const setupDeepLinking = () => {
    const handleDeepLink = ({ url }: { url: string }) => {
        const parsed = Linking.parse(url);

        if (parsed.path === "/join" && parsed.queryParams?.code) {
            const inviteCode = parsed.queryParams.code;
            router.push(`/(auth)/join-event?code=${inviteCode}`);
        }
    };

    // Listener para quando o app está aberto
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Verificar se o app foi aberto por um link
    Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
};
