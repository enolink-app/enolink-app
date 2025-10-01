import { Box, Text, VStack, Pressable, HStack, Icon, Divider } from "@gluestack-ui/themed";
import { Globe, LogOut, ShieldCheck, FileText } from "lucide-react-native";
import { Linking, Alert } from "react-native";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { ArrowLeft, Wine, Calendar, User, PlusIcon, ChevronLeft } from "lucide-react-native";
import { Platform } from "react-native";
import { config } from "@/gluestack-ui.config";
import useLanguageStore from "@/stores/useLanguageStore";
import { useState, useEffect } from "react";
export default function SettingsScreen() {
    const router = useRouter();
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];
    const textDark = config.tokens.colors.textDark;
    const textLight = config.tokens.colors.textLight;
    const goldTransparent = "#B89F5B30";
    const primaryTransparent = "#6B223230";
    const bgLight = config.tokens.colors.backgroundLight;

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);
    const handlesignOut = () => {
        auth.signOut();
        router.replace("/login");
    };

    const handleLogout = async () => {
        Alert.alert(t("register.quit"), t("settings.sureQuit"), [
            { text: t("general.cancel"), style: "cancel" },
            {
                text: t("register.quit"),
                style: "destructive",
                onPress: async () => {
                    try {
                        await handlesignOut();
                        router.replace("/login");
                    } catch (error) {
                        Alert.alert("Erro", "Não foi possível sair da conta.");
                    }
                },
            },
        ]);
    };

    return (
        <Box key={updateKey} flex={1} p={20} bg={neutralLight} mt={Platform.OS == "ios" ? 50 : 0}>
            <HStack justifyContent="flex-start" mb={50}>
                <ChevronLeft onPress={() => router.push("/tabs/(tabs)/profile")} key="half" size={32} style={{ marginRight: 6 }} color={config.tokens.colors.textLight} />
                <Text fontSize="$2xl" fontWeight="$bold" color={neutralDark}>
                    {t("settings.title")}
                </Text>
            </HStack>

            <VStack space="md" justifyContent="center">
                <Pressable h={36} onPress={() => router.push("/privacy")}>
                    <HStack space="lg" alignItems="center">
                        <Icon as={ShieldCheck} size="lg" color={neutralDark} />
                        <Text fontSize="$lg" color={neutralDark}>
                            {t("privacy.text3")} {t("privacy.title")}
                        </Text>
                    </HStack>
                </Pressable>
                <Divider my="$2" />

                <Pressable h={36} onPress={handleLogout}>
                    <HStack space="lg" alignItems="center">
                        <Icon as={LogOut} size="lg" color="$error500" />
                        <Text fontSize="$lg" color="$error500">
                            {t("register.quit")}
                        </Text>
                    </HStack>
                </Pressable>
            </VStack>
        </Box>
    );
}
