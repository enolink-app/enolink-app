// events.tsx - Tela de eventos atualizada
import { Box, ScrollView, Text, HStack, Pressable, Divider } from "@gluestack-ui/themed";
import { useState, useEffect } from "react";
import { EventCard } from "@/components/EventCard";
import { events } from "@/constants/data";
import dayjs from "dayjs";
import { Alert, FlatList } from "react-native";
import "dayjs/locale/pt-br";
import { config } from "@/ui/gluestack-ui.config";
import { useRouter } from "expo-router";
import { useRequest } from "@/hooks/useRequest";
import { useEvents } from "@/hooks/useEvents";
import { calculateDistance } from "@/services/geo";
import { useEventStore } from "@/stores/useEventStore";
import { auth } from "@/lib/firebase";
import useLanguageStore from "@/stores/useLanguageStore";
// Função para formatar a data
function formatDate(dateInput: Date | string | number) {
    const date = new Date(dateInput);
    return dayjs(date).locale("pt-br").format("DD MMM · YYYY");
}

export default function EventsScreen() {
    const router = useRouter();
    const { getAllEvents } = useRequest();
    const { events, refreshEvents, userLocation } = useEvents();
    const { currentEvent, rankings, myEvaluations, isLoading, setAllEvents } = useEventStore();
    const currentUserId = auth.currentUser?.uid;

    const closedEvents = events.length > 0 && events.filter((e) => e?.status == "CLOSED");
    const openedEvents = events.length > 0 && events.filter((e) => e?.status == "STARTED");
    const [selectedTab, setSelectedTab] = useState<"now" | "past">("now");
    const { t } = useLanguageStore();
    useEffect(() => {
        setEvents();
    });

    async function setEvents() {
        const result = await getAllEvents();
        setAllEvents(result);
    }

    const getEventImage = (event) => {
        // Priorizar imagem de capa do evento
        if (event?.coverImage) {
            return { uri: event.coverImage };
        }

        // Fallback para imagem do primeiro vinho
        if (event?.wines && event.wines.length > 0 && event.wines[0]?.image) {
            return { uri: event.wines[0].image };
        }

        // Fallback para placeholder
        return require("../../../assets/images/placeholder.png");
    };

    return (
        <Box flex={1} bg="$backgroundLight" p="$4" mt={50}>
            <Text fontSize="$2xl" fontWeight="$bold" color="$textLight" mb="$4">
                {t("events.title")}
            </Text>

            {/* Tabs */}
            <HStack space="lg" mb="$4">
                <Pressable onPress={() => setSelectedTab("now")}>
                    <Text fontWeight="$bold" mb={6} color={selectedTab === "now" ? config.tokens.colors.primary?.["500"] : "$muted"}>
                        {t("events.now")}
                    </Text>
                    {selectedTab == "now" && <Divider className="my-1" bgColor={config.tokens.colors.primary?.["500"]} />}
                </Pressable>

                <Pressable onPress={() => setSelectedTab("past")}>
                    <Text fontWeight="$bold" mb={6} color={selectedTab === "past" ? config.tokens.colors.primary?.["500"] : "$muted"}>
                        {t("events.closed")}
                    </Text>
                    {selectedTab == "past" && <Divider className="my-1" bgColor={config.tokens.colors.primary?.["500"]} />}
                </Pressable>
            </HStack>

            {/* Lista de eventos */}
            <FlatList
                data={selectedTab === "now" ? openedEvents : closedEvents}
                keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                refreshing={isLoading}
                onRefresh={refreshEvents}
                ListEmptyComponent={
                    isLoading ? (
                        <Text>{t("general.loading")}</Text>
                    ) : (
                        <Box>
                            <Text>{t("events.emptyList")}</Text>
                        </Box>
                    )
                }
                renderItem={({ item, index }) => {
                    let distanceText = "";
                    if (userLocation && item.location) {
                        const distance = calculateDistance(userLocation.latitude, userLocation.longitude, item.location.latitude, item.location.longitude);
                        distanceText = distance < 1 ? `${Math.round(distance * 1000)}m de você` : `${distance.toFixed(1)}km de você`;
                    }

                    const isOrganizer = item?.organizerId == currentUserId;
                    const isParticipant = item?.participants?.some((p) => p.id == currentUserId);

                    return (
                        <EventCard
                            onPress={() => {
                                if (selectedTab == "past") {
                                    Alert.alert("Atenção!", "Esse evento já encerrou.", [
                                        {
                                            text: "Ok",
                                            onPress: () => console.log("Cancel Pressed"),
                                            style: "cancel",
                                        },
                                    ]);
                                } else if (!isOrganizer && !isParticipant) {
                                    router.push(`/tabs/${item?.id}/ranking`);
                                } else {
                                    router.push(`/tabs/${item?.id}/event-room`);
                                }
                            }}
                            key={item?.id || index}
                            image={getEventImage(item)}
                            title={item?.name}
                            date={formatDate(item?.dateStart)}
                            distance={distanceText}
                            isNearby={distanceText && parseFloat(distanceText) < 5}
                        />
                    );
                }}
                showsHorizontalScrollIndicator={false}
            />
        </Box>
    );
}
