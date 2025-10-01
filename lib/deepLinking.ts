import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Platform } from "react-native";

export const setupDeepLinking = () => {
    const handleDeepLink = ({ url }: { url: string }) => {
        const parsed = Linking.parse(url);

        if (parsed.host === "invite-enolink.online" && parsed.path === "/join") {
            const code = parsed.queryParams?.code;
            if (code) {
                router.push(`/(auth)/join-event?code=${code}`);
            }
        }

        if (parsed.scheme === "enolink" && parsed.path === "/join") {
            const code = parsed.queryParams?.code;
            if (code) {
                router.push(`/(auth)/join-event?code=${code}`);
            }
        }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
};
