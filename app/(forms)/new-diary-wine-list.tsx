import { Box, VStack, Heading, Pressable, HStack, Image, Text, ScrollView, Button, ButtonText } from "@gluestack-ui/themed";
import { Plus } from "lucide-react-native";
import { Platform, View } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "expo-router";
import { auth } from "@/lib/firebase";
import { config } from "@/gluestack-ui.config";
import { useWineStore } from "@/stores/useWineStores";
import { ChevronLeft } from "lucide-react-native";
import useLanguageStore from "@/stores/useLanguageStore";
import EventSearchBar from "@/components/EventSearchBar";

export default function SelectWineScreen() {
    const router = useRouter();
    const user = auth.currentUser;
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];
    const userWines = useWineStore((state) => state.userWines);
    const fetchUserWines = useWineStore((state) => state.fetchUserWines);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    useFocusEffect(
        useCallback(() => {
            if (!user) return;
            const organizerId = user.uid;
            setLoading(true);
            fetchUserWines(organizerId);
            setTimeout(() => setLoading(false), 300);
        }, [fetchUserWines, user])
    );

    const [query, setQuery] = useState("");

    const filteredWines = useMemo(() => {
        const q = (query || "").trim().toLowerCase();
        if (!q) return userWines || [];

        return (userWines || []).filter((w: any) => {
            const name = (w?.name || "").toString().toLowerCase();
            const grape = (w?.grape || w?.variety || "").toString().toLowerCase();
            const country = (w?.country || "").toString().toLowerCase();
            const producer = (w?.producer || w?.winery || "").toString().toLowerCase();
            const vintage = (w?.vintage || w?.year || "").toString().toLowerCase();

            return name.includes(q) || grape.includes(q) || country.includes(q) || producer.includes(q) || vintage.includes(q);
        });
    }, [userWines, query]);

    return (
        <Box key={updateKey} flex={1} bg="$backgroundLight" p="$4" mt={Platform.OS == "ios" ? 50 : 0}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                <HStack justifyContent="space-between" alignItems="center">
                    <ChevronLeft ckey="half" size={30} style={{ marginRight: 6 }} color={config.tokens.colors.textLight} onPress={() => router.push("/tabs/diary")} />
                    <Heading size="lg">{t("forms.newDiaryWineList.title")}</Heading>
                </HStack>
            </Box>

            <EventSearchBar value={query} onChange={setQuery} placeholder={t("forms.newDiaryWineList.searchPlaceholder") ?? "Pesquisar seus vinhos..."} />

            {loading ? (
                <Text>{t("general.loading")}</Text>
            ) : (
                <View style={{ justifyContent: "center" }}>
                    <ScrollView style={{ marginBottom: 100 }}>
                        <VStack space="md" mb="$6">
                            {filteredWines.length === 0 ? (
                                <Box px="$4" py="$6" alignItems="center">
                                    <Text color="$muted">{query ? `Nenhum vinho encontrado para "${query}"` : t("general.noItems")}</Text>
                                </Box>
                            ) : (
                                filteredWines.map((wine: any) => (
                                    <Pressable
                                        elevation={5}
                                        shadowColor="#505050"
                                        shadowOffset={{ width: 2, height: 3 }}
                                        shadowOpacity={0.2}
                                        key={wine.id}
                                        bg="white"
                                        borderRadius="$lg"
                                        p="$3"
                                        onPress={() =>
                                            router.push({
                                                pathname: "/(forms)/diary-rating",
                                                params: { wineId: wine.id },
                                            })
                                        }
                                    >
                                        <HStack space="md">
                                            <Image source={{ uri: wine.image }} alt={wine.name} w={70} h={90} borderRadius={8} />
                                            <VStack space="xs" justifyContent="center">
                                                <Text fontWeight="$bold" fontSize="$md">
                                                    {wine.name}
                                                </Text>
                                                <Text>{`🍇 ${wine.grape || "-"}`}</Text>
                                                <Text>{`📍 ${wine.country || "-"}`}</Text>
                                            </VStack>
                                        </HStack>
                                    </Pressable>
                                ))
                            )}
                        </VStack>
                    </ScrollView>

                    <Button
                        position="absolute"
                        bottom={64}
                        w={"$full"}
                        mt="$6"
                        p="$2"
                        flexDirection="row"
                        borderRadius="$lg"
                        bg={primary}
                        alignItems="center"
                        onPress={() => router.push("/(forms)/add-wine-diary")}
                    >
                        <ButtonText fontSize="$md" fontWeight="$medium">
                            {t("forms.newDiaryWineList.new")}
                        </ButtonText>
                        <Plus size={20} color={"white"} />
                    </Button>
                </View>
            )}
        </Box>
    );
}
