import { Box, ScrollView, Text, HStack, Pressable, Divider, Avatar, AvatarImage, Button, ButtonText, VStack } from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import { Settings, ShareIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { config } from "@/ui/gluestack-ui.config";
import useLanguageStore from "@/stores/useLanguageStore";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Platform, Share, Alert } from "react-native";

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState(auth.currentUser);
    const [token, setToken] = useState();
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    await user.reload();

                    const updatedUser = {
                        ...auth.currentUser,
                        displayName: auth.currentUser?.displayName,
                        photoURL: auth.currentUser?.photoURL,
                    };
                    const token = await auth.currentUser?.getIdToken();
                    setToken(token);
                    setUser(updatedUser);
                } catch (error) {
                    console.error("Erro ao recarregar usuário:", error);
                }
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user?.uid) return;

        const userDocRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const userData = doc.data();
                setUser((prev) => ({
                    ...prev,
                    ...userData,
                }));
            }
        });
        return () => unsubscribe();
    }, [user?.uid]);

    const handleInviteFriends = async () => {
        try {
            const inviteLink = "https://come-to-enolink/invite";
            const message = `${t("general.linkApp")} ${inviteLink}`;

            const result = await Share.share({
                message: message,
                title: `${t("general.linkAppTitle")}`,
                url: inviteLink,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log("Compartilhado com:", result.activityType);
                } else {
                    console.log("Compartilhado com sucesso");
                }
            } else if (result.action === Share.dismissedAction) {
                console.log("Compartilhamento cancelado");
            }
        } catch (error) {
            console.error("Erro ao compartilhar:", error);
            Alert.alert("Erro", "Não foi possível compartilhar o convite.");
        }
    };
    console.log(token);
    return (
        <Box key={updateKey} flex={1} bg="$backgroundLight" p="$4" mt={Platform.OS == "ios" ? 50 : 0}>
            <Box mt={20} mb={50} flexDirection="row" justifyContent="space-between">
                <Text color={neutralDark} bold size="xl">
                    {t("me.title")}
                </Text>
                <Settings onPress={() => router.push("/tabs/settings")} size={36} color={config.tokens.colors.textLight} />
            </Box>

            <VStack justifyContent="center" alignItems="center" space="lg">
                <Avatar size="2xl" my={3}>
                    <AvatarImage
                        borderColor={primary}
                        borderWidth={0.5}
                        source={
                            user?.photoURL
                                ? {
                                      uri: user?.photoURL,
                                  }
                                : require("../../../assets/images/placeholder.png")
                        }
                        defaultSource={require("../../../assets/images/placeholder.png")}
                        alt="User avatar"
                    />
                </Avatar>

                <Box alignItems="center">
                    <Text bold size="lg">
                        {user?.displayName || t("me.anonymous")}
                    </Text>
                </Box>

                <HStack justifyContent="space-evenly" w="$96">
                    <Button onPress={() => router.push("/(forms)/edit-profile")} variant="outline" borderRadius={24} borderColor={neutralDark} bg="#FFFFFF">
                        <ButtonText color={neutralDark}>{t("me.edit")}</ButtonText>
                    </Button>
                    <Button onPress={handleInviteFriends} variant="solid" borderRadius={24} bg={primary}>
                        <ButtonText color={neutralLight}>{t("me.invite")}</ButtonText>
                    </Button>
                </HStack>

                <Box mt="$8">
                    <Button size="md" variant="solid" onPress={() => router.push("/tabs/(tabs)/events")} bg={primaryTransparent}>
                        <ButtonText color={primary}>{t("me.myEvents")}</ButtonText>
                    </Button>
                </Box>
            </VStack>
        </Box>
    );
}
