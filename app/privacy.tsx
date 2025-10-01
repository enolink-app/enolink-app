import { Box, ScrollView, Text, Heading, VStack, HStack } from "@gluestack-ui/themed";
import useLanguageStore from "@/stores/useLanguageStore";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import { config } from "@/gluestack-ui.config";
import { useState, useEffect } from "react";
export default function PrivacyPolicyScreen() {
    const router = useRouter();
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    return (
        <Box key={updateKey} flex={1} bg="$backgroundLight" p="$4">
            <HStack justifyContent="flex-start" mt={Platform.OS == "ios" ? 50 : 0}>
                <ChevronLeft onPress={() => router.push("/(settings)/settings")} key="half" size={30} style={{ marginRight: 6 }} color={config.tokens.colors.textLight} />
                <Text fontSize="$2xl" fontWeight="$bold" color="$textLight">
                    {t("settings.title")}
                </Text>
            </HStack>
            <ScrollView showsVerticalScrollIndicator={false}>
                <VStack space="lg">
                    <Heading size="xl" color="$textLight">
                        {t("privacy.title")}
                    </Heading>

                    <Text color="$textLight" fontSize="$md" lineHeight="$md">
                        {t("privacy.text1")}
                    </Text>

                    <Text color="$textLight" fontSize="$md" lineHeight="$md">
                        {t("privacy.text2")}
                    </Text>

                    <Heading size="xl" color="$textLight" mt="$6">
                        {t("privacy.text3")}
                    </Heading>

                    <Text color="$textLight" fontSize="$md" lineHeight="$md">
                        {t("privacy.text4")}
                    </Text>

                    <Text color="$textLight" fontSize="$md" lineHeight="$md">
                        {t("privacy.text5")}
                    </Text>

                    <Text color="$muted" fontSize="$sm" mt="$6" textAlign="center">
                        {t("privacy.text6")}
                    </Text>
                </VStack>
            </ScrollView>
        </Box>
    );
}
