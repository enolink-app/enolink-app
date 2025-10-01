import { Box, Text, HStack, Pressable, Divider, VStack, ScrollView } from "@gluestack-ui/themed";
import { useState, useEffect, useMemo, useCallback } from "react";
import { EventCard } from "@/components/EventCard";
import { Alert, FlatList } from "react-native";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { config } from "@/ui/gluestack-ui.config";
import { useRouter } from "expo-router";
import { useRequest } from "@/hooks/useRequest";
import { useEvents } from "@/hooks/useEvents";
import { calculateDistance } from "@/services/geo";
import { useEventStore } from "@/stores/useEventStore";
import { auth } from "@/lib/firebase";
import useLanguageStore from "@/stores/useLanguageStore";
import { Platform } from "react-native";
import EventSearchBar from "@/components/EventSearchBar";

function formatDate(dateInput: Date | string | number) {
    const date = new Date(dateInput);
    return dayjs(date).locale("pt-br").format("DD MMM · YYYY");
}

const imageCache = new Map();

export default function EventsScreen() {
    const router = useRouter();
    const { getEventByUser } = useRequest();
    const { events, isLoading, refreshEvents, userLocation } = useEvents();
    const { currentEvent, rankings, myEvaluations, setAllEvents } = useEventStore();
    const [updateKey, setUpdateKey] = useState(0);
    const currentUserId = auth.currentUser?.uid;
    const [eventsUser, setEventsUser] = useState([]);
    const [selectedMainTab, setSelectedMainTab] = useState<"all" | "my">("all");
    const [selectedSubTab, setSelectedSubTab] = useState<"created" | "joined">("created");
    const [selectedEventTab, setSelectedEventTab] = useState<"now" | "past">("now");
    const [query, setQuery] = useState("");
    const { t, forceUpdate } = useLanguageStore();

    const { closedEvents, openedEvents } = useMemo(() => {
        if (!events || events.length === 0) {
            return { closedEvents: [], openedEvents: [] };
        }

        const closed = events.filter((e) => e?.status === "CLOSED" || e?.status === "FINISHED");
        const opened = events.filter((e) => e?.status === "STARTED" || e?.status === "OPEN");

        return { closedEvents: closed, openedEvents: opened };
    }, [events]);

    useEffect(() => {
        const loadUserEvents = async () => {
            if (auth.currentUser && eventsUser.length === 0) {
                try {
                    const response = await getEventByUser();
                    setEventsUser(response || []);
                } catch (error) {
                    console.error("Erro ao carregar eventos do usuário:", error);
                    setEventsUser([]);
                }
            }
        };
        loadUserEvents();
    }, []);

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    const getEventImage = useCallback((event) => {
        if (!event) return require("../../../assets/images/placeholder.png");

        const cacheKey = event.id || JSON.stringify(event);

        if (imageCache.has(cacheKey)) {
            return imageCache.get(cacheKey);
        }

        let imageSource;
        if (event?.coverImage) {
            imageSource = { uri: event.coverImage };
        } else if (event?.wines && event.wines.length > 0 && event.wines[0]?.image) {
            imageSource = { uri: event.wines[0].image };
        } else {
            imageSource = require("../../../assets/images/placeholder.png");
        }

        imageCache.set(cacheKey, imageSource);
        return imageSource;
    }, []);

    const { userCreatedEvents, userJoinedEvents } = useMemo(() => {
        const created = eventsUser.filter((event) => event.status === "STARTED" || event.status === "OPEN");
        const joined = eventsUser.filter((event) => event.status === "CLOSED" || event.status === "FINISHED");
        return { userCreatedEvents: created, userJoinedEvents: joined };
    }, [eventsUser]);

    const currentEvents = useMemo(() => {
        if (selectedMainTab === "all") {
            return selectedEventTab === "now" ? openedEvents : closedEvents;
        } else {
            return selectedSubTab === "created" ? userCreatedEvents : userJoinedEvents;
        }
    }, [selectedMainTab, selectedEventTab, selectedSubTab, openedEvents, closedEvents, userCreatedEvents, userJoinedEvents]);

    const filteredEvents = useMemo(() => {
        const q = (query || "").trim().toLowerCase();
        if (!q) return currentEvents;

        return currentEvents.filter((e: any) => {
            const name = (e?.name || "").toString().toLowerCase();
            const wines = (e?.wines || [])
                .map((w: any) => w?.name || "")
                .join(" ")
                .toLowerCase();
            const locationText = (e?.location?.address || e?.location?.name || "").toString().toLowerCase();
            const dateStr = formatDate(e?.dateStart || e?.date || "").toLowerCase();

            return name.includes(q) || wines.includes(q) || locationText.includes(q) || dateStr.includes(q);
        });
    }, [currentEvents, query]);

    const renderEventItem = useCallback(
        ({ item, index }) => {
            let distanceText = "";
            if (userLocation && item.location) {
                const distance = calculateDistance(userLocation.latitude, userLocation.longitude, item.location.latitude, item.location.longitude);
                distanceText = distance < 1 ? `${Math.round(distance * 1000)}m de você` : `${distance.toFixed(1)}km de você`;
            }

            const isOrganizer = item?.organizerId === currentUserId;
            const isParticipant = item?.participants?.some((p) => p.id === currentUserId);
            const isClosed = item?.status === "CLOSED" || item?.status === "FINISHED";

            const handlePress = () => {
                if (isClosed) {
                    router.push(`/tabs/${item?.id}/ranking`);
                } else if (!isOrganizer && !isParticipant) {
                    router.push(`/tabs/${item?.id}/ranking`);
                } else {
                    router.push(`/tabs/${item?.id}/event-room`);
                }
            };

            return (
                <Box mx="$1" mb="$3">
                    <EventCard
                        onPress={handlePress}
                        key={item?.id || index}
                        image={getEventImage(item)}
                        title={item?.name}
                        date={formatDate(item?.dateStart)}
                        distance={distanceText}
                        isNearby={distanceText && parseFloat(distanceText) < 5}
                        badge={""}
                        status={item?.status}
                        text={isOrganizer || isParticipant ? t("events.join") : t("events.see")}
                    />
                </Box>
            );
        },
        [userLocation, currentUserId, router, getEventImage]
    );

    const listEmptyComponent = useMemo(() => {
        if (isLoading) {
            return <Text>{t("general.loading")}</Text>;
        }

        if (query) {
            return (
                <Text>
                    {t("events.notFound")} "{query}"
                </Text>
            );
        }

        return (
            <Box py="$4" alignItems="center">
                <Text color="$muted">{selectedMainTab === "all" ? t("events.emptyList") : selectedSubTab === "created" ? t("events.emptyList") : t("events.emptyList")}</Text>
            </Box>
        );
    }, [isLoading, query, selectedMainTab, selectedSubTab, t]);

    return (
        <Box key={updateKey} flex={1} bg="$backgroundLight" p="$4" mt={Platform.OS == "ios" ? 50 : 0}>
            <Text fontSize="$2xl" fontWeight="$bold" color="$textLight" mb="$4">
                {t("events.title")}
            </Text>

            <EventSearchBar value={query} onChange={setQuery} placeholder={t("events.searchPlaceholder") ?? "Pesquisar eventos..."} />

            <HStack space="lg" mb="$4">
                <Pressable onPress={() => setSelectedMainTab("all")}>
                    <Text fontWeight="$bold" mb={6} color={selectedMainTab === "all" ? config.tokens.colors.primary?.["500"] : "$muted"}>
                        {t("events.allEvents")}
                    </Text>
                    {selectedMainTab === "all" && <Divider my={1} bg={config.tokens.colors.primary?.["500"]} />}
                </Pressable>

                <Pressable onPress={() => setSelectedMainTab("my")}>
                    <Text fontWeight="$bold" mb={6} color={selectedMainTab === "my" ? config.tokens.colors.primary?.["500"] : "$muted"}>
                        {t("events.myEvents")}
                    </Text>
                    {selectedMainTab === "my" && <Divider my={1} bg={config.tokens.colors.primary?.["500"]} />}
                </Pressable>
            </HStack>

            {selectedMainTab === "all" && (
                <HStack space="lg" mb="$4">
                    <Pressable onPress={() => setSelectedEventTab("now")}>
                        <Text fontWeight="$bold" mb={6} color={selectedEventTab === "now" ? config.tokens.colors.primary?.["500"] : "$muted"}>
                            {t("events.now")}
                        </Text>
                        {selectedEventTab === "now" && <Divider my={1} bg={config.tokens.colors.primary?.["500"]} />}
                    </Pressable>

                    <Pressable onPress={() => setSelectedEventTab("past")}>
                        <Text fontWeight="$bold" mb={6} color={selectedEventTab === "past" ? config.tokens.colors.primary?.["500"] : "$muted"}>
                            {t("events.closed")}
                        </Text>
                        {selectedEventTab === "past" && <Divider my={1} bg={config.tokens.colors.primary?.["500"]} />}
                    </Pressable>
                </HStack>
            )}

            {selectedMainTab === "my" && (
                <HStack space="lg" mb="$4">
                    <Pressable onPress={() => setSelectedSubTab("created")}>
                        <Text fontWeight="$bold" mb={6} color={selectedSubTab === "created" ? config.tokens.colors.primary?.["500"] : "$muted"}>
                            {t("me.created")}
                        </Text>
                        {selectedSubTab === "created" && <Divider my={1} bg={config.tokens.colors.primary?.["500"]} />}
                    </Pressable>

                    <Pressable onPress={() => setSelectedSubTab("joined")}>
                        <Text fontWeight="$bold" mb={6} color={selectedSubTab === "joined" ? config.tokens.colors.primary?.["500"] : "$muted"}>
                            {t("me.joined")}
                        </Text>
                        {selectedSubTab === "joined" && <Divider my={1} bg={config.tokens.colors.primary?.["500"]} />}
                    </Pressable>
                </HStack>
            )}

            <FlatList
                data={filteredEvents}
                keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                refreshing={isLoading}
                onRefresh={refreshEvents}
                ListEmptyComponent={listEmptyComponent}
                renderItem={renderEventItem}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={5}
            />
        </Box>
    );
}
