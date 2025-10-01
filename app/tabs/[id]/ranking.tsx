import { useEffect, useState } from "react";
import { Box, Heading, VStack, HStack, Text, Image, FlatList, Button, ButtonText } from "@gluestack-ui/themed";
import { useLocalSearchParams } from "expo-router";
import { useRequest } from "@/hooks/useRequest";
import { ChevronLeft } from "lucide-react-native";
import { useNavigation } from "expo-router";
import { config } from "@/gluestack-ui.config";
import { useRouter } from "expo-router";
import { MedalIcon } from "lucide-react-native";
import useLanguageStore from "@/stores/useLanguageStore";
import { Platform } from "react-native";
const Medal = ({ place }: { place: 1 | 2 | 3 }) => {
    const medalColors = {
        1: "#faca2a",
        2: "#A1A1AA",
        3: "#FDBA74",
    };
    return (
        <Box bg={medalColors[place]} px="$3" py="$1" rounded="$md" mt="$2">
            <Text color="$white" fontWeight="$bold">
                #{place}
            </Text>
        </Box>
    );
};

export default function EventRankingScreen() {
    const { id: eventId } = useLocalSearchParams();
    const router = useRouter();
    const { getRanking } = useRequest();
    const navigation = useNavigation();
    const [rankedWines, setRankedWines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const textLight = config.tokens.colors.textLight;
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    useEffect(() => {
        getWineRanking();
    }, [eventId]);

    async function getWineRanking() {
        const data = await getRanking(eventId);
        setRankedWines(data);
    }

    const top3 = rankedWines.slice(0, 3);
    const rest = rankedWines.slice(3);

    return (
        <Box key={updateKey} flex={1} bg="$backgroundLight" p="$4" mt={Platform.OS == "ios" ? 50 : 0}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                <HStack justifyContent="space-between" alignItems="center">
                    <ChevronLeft onPress={() => router.back()} key="half" size={30} style={{ marginRight: 6 }} color={config.tokens.colors.textLight} />

                    <Heading size="lg">Ranking</Heading>
                </HStack>
            </Box>
            <Text textAlign="center" color="$muted" mb="$4">
                {rankedWines.length > 0 ? `${rankedWines.length} vinhos avaliados` : "Sem vinhos avaliados no momento..."}
            </Text>
            <Button variant="solid" backgroundColor={primary} onPress={() => router.push(`https://ivino-app.web.app/ranking?id=${eventId}`)}>
                <ButtonText mx={12}>{t("ranking.view")}</ButtonText>
                <MedalIcon size={20} color={"#f2b71f"} />
            </Button>

            <HStack justifyContent="space-between" mb="$6">
                {top3.map((wine, index) => (
                    <Box key={wine.id} alignItems="center" w="30%" bg={index === 0 ? "$white" : "$muted100"} p="$2" rounded="$lg" shadow="$1">
                        {wine.image && <Image source={{ uri: wine.image }} w={70} h={130} resizeMode="contain" alt={wine.name} />}
                        <Text fontWeight="$bold" fontSize="$sm" mt="$2" textAlign="center">
                            {wine.name}
                        </Text>
                        <Text fontSize="$xs" color="$muted">
                            {wine.region}
                        </Text>
                        <HStack justifyContent="center" alignItems="center" mt="$1">
                            <Text fontSize="$md">⭐</Text>
                            <Text fontWeight="$bold" ml="$1">
                                {wine.rating}
                            </Text>
                        </HStack>
                        <Medal place={(index + 1) as 1 | 2 | 3} />
                    </Box>
                ))}
            </HStack>

            <FlatList
                data={rest}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <HStack bg="$white" alignItems="center" justifyContent="space-between" px="$4" py="$3" mb="$2" rounded="$md" shadow="$1">
                        <Text color="$muted" fontWeight="$bold">
                            #{index + 4}
                        </Text>
                        <VStack flex={1} mx="$3">
                            <Text fontWeight="$bold">{item.name}</Text>
                            <Text color="$muted" fontSize="$sm">
                                {item.region}
                            </Text>
                        </VStack>
                        <HStack alignItems="center">
                            <Text fontSize="$md">⭐</Text>
                            <Text fontWeight="$bold" ml="$1">
                                {item.rating.toFixed(1)}
                            </Text>
                        </HStack>
                    </HStack>
                )}
                ListEmptyComponent={
                    !loading && (
                        <Text textAlign="center" color="$muted">
                            {t("ranking.emptyList")}
                        </Text>
                    )
                }
            />

            <Button mt="$6" bg="$primary">
                <ButtonText>{t("ranking.finish")}</ButtonText>
            </Button>
        </Box>
    );
}
