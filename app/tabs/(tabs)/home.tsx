import React, { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, Modal } from "react-native";
import { Button, Text, ButtonText, Heading, HStack, VStack, Box, Image, ScrollView, StarIcon, ButtonIcon } from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import { config } from "@/ui/gluestack-ui.config";
import { useEventStore } from "@/stores/useEventStore";
import useLanguageStore from "@/stores/useLanguageStore";
import { PlusIcon } from "lucide-react-native";
import { ModalBackdrop, ModalContent, ModalHeader } from "@/components/ui/modal";

export default function HomeScreen() {
    const { topWines, isLoading, getTop10Wines } = useEventStore();
    const [showModal, setShowModal] = React.useState(false);
    const [wineDetails, setWineDetails] = useState([]);
    const [updateKey, setUpdateKey] = useState(0);
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];
    const router = useRouter();

    const { t, forceUpdate } = useLanguageStore();

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    useEffect(() => {
        getTop10Wines();
    }, []);

    const handleNewEventPress = () => {
        router.push("/(forms)/new-event");
    };
    function QuadGrid() {
        return (
            <VStack key={updateKey} space="md" p="$4">
                <HStack space="md">
                    <SquareCard bg={primary} onPress={() => router.push("/tabs/diary")} title={t("home.diary")} />
                    <SquareCard bg={accent} onPress={() => router.push("/(forms)/wine-calculator")} title={t("home.calculator")} />
                </HStack>

                <HStack space="md">
                    <SquareCard bg={gold} onPress={() => router.push("/(forms)/new-event")} title={t("home.event")} />
                    <SquareCard bg={neutralDark} onPress={() => router.push("/(forms)/new-wine")} title={t("home.wine")} />
                </HStack>
            </VStack>
        );
    }

    function SquareCard({ title, onPress, bg }: { title: string; onPress: () => void; bg: string }) {
        return (
            <Button onPress={onPress} size="md" variant="solid" m="$0" flex={1} aspectRatio={1} justifyContent="center" alignItems="center" bg={bg} borderRadius="$lg">
                <ButtonText fontWeight="$bold" textAlign="center" color={neutralLight}>
                    {title}
                </ButtonText>
            </Button>
        );
    }

    function renderTopWine({ item }: { item: (typeof topWines)[0] }) {
        return (
            <TouchableOpacity
                style={{
                    width: 200,
                    backgroundColor: "white",
                    padding: 16,
                    borderRadius: 12,
                    marginRight: 16,
                }}
                onPress={() => {
                    setShowModal(true);
                    setWineDetails(item);
                }}
            >
                <Image
                    source={item.image && item.image.includes("https") ? item.image : require("../../../assets/images/placeholder.png")}
                    alt={item.name}
                    w="$full"
                    h={120}
                    resizeMode="contain"
                    rounded="$md"
                    mb="$2"
                />
                <VStack space="xs">
                    <Text fontWeight="$bold" fontSize="$md">
                        {item.name}
                    </Text>
                    <Text color="$muted" fontSize="$sm">
                        {item.country}
                    </Text>

                    <HStack alignItems="center" space="sm">
                        <Box flexDirection="row">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon
                                    key={i}
                                    size="md"
                                    fill={i < Math.floor(item.averageRating) ? gold : "$muted"}
                                    color={i < Math.floor(item.averageRating) ? gold : "$muted"}
                                    mr="$1"
                                />
                            ))}
                        </Box>
                        <Text fontSize="$sm">
                            {item.averageRating.toFixed(1)} ({item.totalEvaluations})
                        </Text>
                    </HStack>

                    <Button variant="link" size="sm" mt="$2">
                        <ButtonText color={accent}>{t("home.details")}</ButtonText>
                    </Button>
                </VStack>
            </TouchableOpacity>
        );
    }

    return (
        <>
            <ScrollView key={updateKey} bgColor={neutralLight} flex={1} p="$4" mt="$10">
                <Heading fontSize="$xl" mb="$4">
                    {t("home.today")}
                </Heading>

                <QuadGrid />

                <Box my="$8">
                    <Heading fontSize="$xl" mb="$2" color={neutralDark}>
                        {t("home.highToday")}
                    </Heading>
                    <Text color="$muted" mb="$4">
                        {t("home.checkout")}
                    </Text>

                    {isLoading ? (
                        <Text>{t("general.loading")}</Text>
                    ) : topWines.length === 0 ? (
                        <Text>{t("general.noWines")}</Text>
                    ) : (
                        <FlatList
                            horizontal
                            data={topWines}
                            renderItem={renderTopWine}
                            keyExtractor={(item) => item.wineId}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingVertical: 8 }}
                        />
                    )}
                    <Modal
                        onRequestClose={() => {
                            setShowModal(false);
                        }}
                        animationType="slide"
                        transparent={true}
                        visible={showModal}
                    >
                        <Box flex={1} justifyContent="center" px="$4" alignItems="center" bg="rgba(0,0,0,0.5)">
                            <Box w="$full" p="$6" bg="white" borderRadius="$lg">
                                <Image source={{ uri: wineDetails?.image }} alt={wineDetails.name} w="$full" h={120} resizeMode="contain" rounded="$md" mb="$2" />
                                <VStack space="xs" m="$4">
                                    <Text fontWeight="$bold" fontSize="$md">
                                        {wineDetails?.name}
                                    </Text>
                                    <Text color="$muted" fontSize="$sm">
                                        {wineDetails?.country}
                                    </Text>

                                    <HStack alignItems="center" space="sm">
                                        <Box flexDirection="row">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon
                                                    key={i}
                                                    size="md"
                                                    fill={i < Math.floor(wineDetails?.averageRating) ? gold : "$muted"}
                                                    color={i < Math.floor(wineDetails?.averageRating) ? gold : "$muted"}
                                                    mr="$1"
                                                />
                                            ))}
                                        </Box>
                                        <Text fontSize="$sm">
                                            {wineDetails?.averageRating?.toFixed(1)} ({wineDetails?.totalEvaluations})
                                        </Text>
                                    </HStack>
                                </VStack>

                                <Button
                                    backgroundColor={primary}
                                    onPress={() => {
                                        setShowModal(false);
                                    }}
                                >
                                    <ButtonText>{t("general.close")}</ButtonText>
                                </Button>
                            </Box>
                        </Box>
                    </Modal>
                </Box>
            </ScrollView>
            <Button
                position="absolute"
                bottom="$0"
                alignSelf="center"
                size="xl"
                h="$16"
                width="$16"
                alignItems="center"
                justifyContent="center"
                borderRadius="$full"
                backgroundColor={primary}
                onPress={handleNewEventPress}
            >
                <ButtonIcon as={PlusIcon} color="white" size="xl" />
            </Button>
        </>
    );
}
