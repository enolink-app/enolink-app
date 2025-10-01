import { useEffect, useCallback, useState, useMemo } from "react";
import { useFocusEffect } from "expo-router";
import { View, FlatList } from "react-native";
import { Button, Text, ButtonText, Card, HStack, VStack, Box } from "@gluestack-ui/themed";
import { auth } from "@/lib/firebase";
import { useRouter } from "expo-router";
import WineCardUser from "@/components/WineCardUser";
import { PlusIcon } from "lucide-react-native";
import { config } from "@/ui/gluestack-ui.config";
import { useWineStore } from "@/stores/useWineStores";
import useLanguageStore from "@/stores/useLanguageStore";
import { Platform } from "react-native";
import EventSearchBar from "@/components/EventSearchBar";

export default function TabScreen() {
    const userWines = useWineStore((state) => state.userWines);
    const loading = useWineStore((state) => state.loading);
    const error = useWineStore((state) => state.error);
    const user = auth.currentUser;
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    const fetchUserWines = useWineStore((state) => state.fetchUserWines);
    useFocusEffect(
        useCallback(() => {
            if (!user) return;
            const organizerId = user.uid;
            fetchUserWines(organizerId);
        }, [fetchUserWines, user])
    );

    const router = useRouter();

    const [query, setQuery] = useState("");

    const filteredWines = useMemo(() => {
        const q = (query || "").trim().toLowerCase();
        if (!q) return userWines || [];

        return (userWines || []).filter((w: any) => {
            const name = (w?.name || "").toString().toLowerCase();
            const grape = (w?.grape || w?.variety || "").toString().toLowerCase();
            const producer = (w?.producer || w?.winery || "").toString().toLowerCase();
            const region = (w?.region || w?.country || "").toString().toLowerCase();
            const vintage = (w?.vintage || w?.year || "").toString().toLowerCase();

            return name.includes(q) || grape.includes(q) || producer.includes(q) || region.includes(q) || vintage.includes(q);
        });
    }, [userWines, query]);

    return (
        <Box key={updateKey} flex={1} p="$4" bg="$backgroundLight" mt={Platform.OS == "ios" ? 50 : 0}>
            <Box my="$4">
                <Text fontSize="$xl" bold>
                    {t("wines.title")}
                </Text>
            </Box>

            <EventSearchBar value={query} onChange={setQuery} placeholder={t("wines.searchPlaceholder") ?? "Pesquisar seus vinhos..."} />

            {loading && (
                <View style={{ flex: 1 }}>
                    <Text>{t("general.loading")}</Text>
                </View>
            )}

            {error && <Text color="$error500">{t("general.noItems") && error}</Text>}

            {!loading && !error && (
                <FlatList
                    data={filteredWines}
                    keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                    ListEmptyComponent={
                        query ? (
                            <Box py="$4" alignItems="center">
                                <Text color="$muted">
                                    {t("wines.notFound")} "{query}"
                                </Text>
                            </Box>
                        ) : (
                            <Box py="$4">
                                <Text>{t("general.noItems")}</Text>
                            </Box>
                        )
                    }
                    renderItem={({ item, index }) => (
                        <Box mx="$1" mb="$3">
                            <WineCardUser key={index} wine={item} />
                        </Box>
                    )}
                    showsVerticalScrollIndicator={false}
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
                bg={primary}
                borderRadius="$3xl"
                onPress={() => router.push("/(forms)/new-wine")}
            >
                <ButtonText size="md">{t("wines.add")}</ButtonText>
            </Button>
        </Box>
    );
}
