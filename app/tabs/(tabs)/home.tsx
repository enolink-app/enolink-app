// app/tabs/(tabs)/home.tsx
import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { Button, Text, ButtonText, Heading, HStack, VStack, Box, Image, ScrollView, StarIcon, ButtonIcon, Center } from "@gluestack-ui/themed";
import { auth } from "@/lib/firebase";
import { useRouter } from "expo-router";
import { config } from "@/ui/gluestack-ui.config";
import { useEventStore } from "@/stores/useEventStore";
import useLanguageStore from "@/stores/useLanguageStore";
import { SafeAreaView } from "react-native";
import { PlusIcon } from "lucide-react-native";
import { Icon, CloseIcon } from "@/components/ui/icon";
import { Modal, ModalBackdrop, ModalContent, ModalCloseButton, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";

export default function HomeScreen() {
    const { topWines, isLoading, getTop10Wines } = useEventStore();
    const [showModal, setShowModal] = React.useState(false);
    const [wineDetails, setWineDetails] = useState([]);
    const router = useRouter();
    const { t } = useLanguageStore();

    useEffect(() => {
        getTop10Wines();
    }, []);
    const handleNewEventPress = () => {
        router.push("/(forms)/new-event");
    };
    function QuadGrid() {
        return (
            <VStack space="md" p="$4">
                <HStack space="md">
                    <SquareCard onPress={() => router.push("/tabs/diary")} title={t("home.diary")} />
                    <SquareCard onPress={() => router.push("/(forms)/wine-calculator")} title={t("home.calculator")} />
                </HStack>

                <HStack space="md">
                    <SquareCard onPress={() => router.push("/(forms)/new-event")} title={t("home.event")} />
                    <SquareCard onPress={() => router.push("/(forms)/new-wine")} title={t("home.wine")} />
                </HStack>
            </VStack>
        );
    }

    function SquareCard({ title, onPress }: { title: string; onPress: () => void }) {
        return (
            <Button
                onPress={onPress}
                size="md"
                variant="solid"
                m="$0"
                flex={1}
                aspectRatio={1}
                justifyContent="center"
                alignItems="center"
                bg={config.tokens.colors.primary?.["500"]}
                borderRadius="$lg"
            >
                <ButtonText fontWeight="$bold" textAlign="center" color="white">
                    {title}
                </ButtonText>
            </Button>
        );
    }

    function renderTopWine({ item }: { item: (typeof topWines)[0] }) {
        return (
            <Box w={200} bg="$white" p="$4" borderRadius="$lg" mr="$4">
                <Image source={{ uri: item.image }} alt={item.name} w="$full" h={120} resizeMode="contain" rounded="$md" mb="$2" />
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
                                    fill={i < Math.floor(item.averageRating) ? "$yellow500" : "$muted"}
                                    color={i < Math.floor(item.averageRating) ? "$yellow500" : "$muted"}
                                    mr="$1"
                                />
                            ))}
                        </Box>
                        <Text fontSize="$sm">
                            {item.averageRating.toFixed(1)} ({item.totalEvaluations})
                        </Text>
                    </HStack>

                    <Button
                        variant="link"
                        size="sm"
                        mt="$2"
                        onPress={() => {
                            setShowModal(true);
                            setWineDetails(item);
                        }}
                    >
                        <ButtonText>{t("home.details")}</ButtonText>
                    </Button>
                </VStack>
            </Box>
        );
    }

    return (
        <>
            <ScrollView flex={1} p="$4" mt="$10">
                <Heading fontSize="$xl" mb="$4">
                    {t("home.today")}
                </Heading>

                <QuadGrid />

                <Box my="$8">
                    <Heading fontSize="$xl" mb="$2">
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
                        isOpen={showModal}
                        onClose={() => {
                            setShowModal(false);
                        }}
                        size="md"
                    >
                        <ModalBackdrop />
                        <ModalContent size="sm" style={{ backgroundColor: "rgba(50, 50, 50, 0.3)" }}>
                            <Box w="$full" h="$72" p="$10" bg="white" justifyContent="space-between">
                                <ModalHeader>
                                    <Image source={{ uri: wineDetails?.image }} alt={wineDetails.name} w="$full" h={120} resizeMode="contain" rounded="$md" mb="$2" />
                                    <VStack space="xs">
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
                                                        fill={i < Math.floor(wineDetails?.averageRating) ? "$yellow500" : "$muted"}
                                                        color={i < Math.floor(wineDetails?.averageRating) ? "$yellow500" : "$muted"}
                                                        mr="$1"
                                                    />
                                                ))}
                                            </Box>
                                            <Text fontSize="$sm">
                                                {wineDetails?.averageRating} ({wineDetails?.totalEvaluations})
                                            </Text>
                                        </HStack>
                                    </VStack>
                                </ModalHeader>
                                <HStack w="$full" justifyContent="space-around" my={6}>
                                    <Button
                                        variant="outline"
                                        action="secondary"
                                        onPress={() => {
                                            setShowModal(false);
                                        }}
                                    >
                                        <ButtonText>Fechar</ButtonText>
                                    </Button>
                                </HStack>
                            </Box>
                        </ModalContent>
                    </Modal>
                </Box>
            </ScrollView>
            <Button
                position="absolute"
                bottom="$0" // Ajuste a posição para não colidir com a tab bar
                right="$2.5"
                //left="$0"
                size="xl"
                h="$16"
                minWidth="$1/2"
                alignItems="center"
                justifyContent="space-between"
                borderRadius="$full"
                backgroundColor="#5D1728"
                onPress={handleNewEventPress}
                style={{
                    bottom: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    position: "absolute",
                    zIndex: 9999,
                    width: 70,
                }}
            >
                <ButtonText>{t("home.event")}</ButtonText>
                <ButtonIcon as={PlusIcon} color="white" size="xl" />
            </Button>
        </>
    );
}
