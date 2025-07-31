import { useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { View, FlatList } from "react-native";
import { Button, Text, ButtonText, ButtonIcon, Card, Heading, HStack, VStack, Box } from "@gluestack-ui/themed";
import { auth } from "@/lib/firebase";
import { useRouter } from "expo-router";
import { winesUser } from "@/constants/data";
import WineCardUser from "@/components/WineCardUser";
import { Star, Wine, Grape, MapPin, PlusIcon } from "lucide-react-native";
import { config } from "@/ui/gluestack-ui.config";
import { useWineStore } from "@/stores/useWineStores";
import useLanguageStore from "@/stores/useLanguageStore";

export default function TabScreen() {
    const userWines = useWineStore((state) => state.userWines);
    const loading = useWineStore((state) => state.loading);
    const error = useWineStore((state) => state.error);
    const user = auth.currentUser;
    const { t } = useLanguageStore();
    const fetchUserWines = useWineStore((state) => state.fetchUserWines);
    useFocusEffect(
        useCallback(() => {
            const organizerId = user.uid; // Obtenha o ID do organizador
            fetchUserWines(organizerId);
        }, [fetchUserWines]) // 'fetchUserWines' é uma função estável do Zustand, não causará loop
    );
    console.log("🌈 Tema carregado com primary500:", config.tokens.colors.primary?.["500"]);
    const router = useRouter();

    return (
        <Box flex={1} p={20} justifyContent="center" mt={50}>
            <Box my="$4">
                <Text fontSize="$xl" bold>
                    {t("wines.title")}
                </Text>
            </Box>
            {loading && <Text>{t("general.loading")}</Text>}
            {error && <Text color="$error500">{t("general.noItems") && error}</Text>}
            {!loading && !error && (
                <FlatList
                    data={userWines}
                    keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                    ListEmptyComponent={
                        <Box>
                            <Text>{t("general.noItems")}</Text>
                        </Box>
                    }
                    renderItem={({ item, index }) => <WineCardUser key={index} wine={item} />}
                    showsHorizontalScrollIndicator={false}
                />
            )}
            <Button
                w={170}
                h={50}
                right={6}
                bottom={12}
                position="absolute"
                justifyContent="space-evenly"
                alignItems="center"
                size="md"
                bg={config.tokens.colors.primary["500"]}
                borderRadius="$3xl"
            >
                <ButtonText onPress={() => router.push("/(forms)/new-wine")} size="md">
                    {t("wines.add")}
                </ButtonText>
                <PlusIcon key="half" size={24} color={config.tokens.colors.textDark} />
            </Button>
        </Box>
    );
}
