import { Box, FlatList, Heading, Icon, ButtonIcon, Button, HStack, VStack, Text, ButtonText, Image } from "@gluestack-ui/themed";
import { Plus, ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { DiaryCard } from "@/components/DiaryCard";
import { config } from "@/gluestack-ui.config";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { useRequest } from "@/hooks/useRequest";
import { auth } from "@/lib/firebase";
import { Modal, Pressable } from "react-native";
import { StarIcon } from "lucide-react-native";
import useLanguageStore from "@/stores/useLanguageStore";
export default function DiaryScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { getDiaryEntries } = useRequest();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { t } = useLanguageStore();
    const primary = config.tokens.colors.primary["500"];
    const textDark = config.tokens.colors.textDark;
    const textLight = config.tokens.colors.textLight;

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const data = await getDiaryEntries();
                setEntries(data);
            } catch (error) {
                console.error("Error fetching diary entries:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEntries();
    }, []);

    const handleEntryPress = (entry) => {
        setSelectedEntry(entry);
        setModalVisible(true);
    };

    return (
        <Box flex={1} bg="$backgroundLight" p="$4" pt="$10">
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                <HStack alignItems="center" space="md">
                    <ChevronLeft color={textLight} size={32} onPress={() => router.back()} />
                    <Heading size="lg">{t("diary.title")}</Heading>
                </HStack>

                <Button size="sm" bgColor={primary} borderRadius="$full" onPress={() => router.push("/(forms)/new-diary-wine-list")}>
                    <ButtonIcon as={Plus} color={textDark} />
                </Button>
            </Box>

            {loading ? (
                <Text>{t("general.loading")}</Text>
            ) : entries.length === 0 ? (
                <VStack flex={1} justifyContent="center" alignItems="center">
                    <Text color="$muted" mb="$4">
                        {t("general.noItems")}
                    </Text>
                    <Button onPress={() => router.push("/(forms)/new-diary-wine-list")}>
                        <ButtonText>{t("diary.addFirst")}</ButtonText>
                    </Button>
                </VStack>
            ) : (
                <FlatList
                    data={entries}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <DiaryCard
                            id={item.id}
                            image={item.wineData.image}
                            name={item.wineData.name}
                            type={item.wineData.type}
                            country={item.wineData.country}
                            rating={item.average}
                            date={item.createdAt}
                            onPress={() => handleEntryPress(item)}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Modal de detalhes */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <Box flex={1} justifyContent="center" alignItems="center" bg="rgba(0,0,0,0.5)">
                    <Box bg="$white" p="$6" borderRadius="$lg" w="90%">
                        {selectedEntry && (
                            <>
                                <HStack space="md" alignItems="center" mb="$4" elevation={3}>
                                    <Image source={{ uri: selectedEntry.wineData.image }} alt={selectedEntry.wineData.name} w={80} h={100} borderRadius="$md" resizeMode="cover" />
                                    <VStack>
                                        <Heading size="md">{selectedEntry.wineData.name}</Heading>
                                        <Text>
                                            {selectedEntry.wineData.type} • {selectedEntry.wineData.country}
                                        </Text>
                                        <HStack alignItems="center" mt="$2">
                                            <StarIcon size="sm" fill="$yellow500" color="$yellow500" />
                                            <Text ml="$1">{selectedEntry.average.toFixed(1)}</Text>
                                        </HStack>
                                    </VStack>
                                </HStack>

                                <VStack space="sm" mb="$4">
                                    <Text fontWeight="$bold">{t("diary.notes")}</Text>
                                    <Text>{selectedEntry.notes || t("general.noItems")}</Text>
                                </VStack>

                                <HStack space="sm">
                                    <Text fontWeight="$bold">{t("diary.color")}</Text>
                                    <Text>{selectedEntry.color}/5</Text>
                                </HStack>
                                <HStack space="sm">
                                    <Text fontWeight="$bold">{t("diary.aroma")}</Text>
                                    <Text>{selectedEntry.aroma}/5</Text>
                                </HStack>
                                <HStack space="sm" mb="$4">
                                    <Text fontWeight="$bold">{t("diary.flavor")}</Text>
                                    <Text>{selectedEntry.flavor}/5</Text>
                                </HStack>

                                <Button backgroundColor={primary} onPress={() => setModalVisible(false)}>
                                    <ButtonText>{t("diary.close")}</ButtonText>
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}
