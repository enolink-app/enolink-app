import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { useEventStore, useEventSelectors } from "@/stores/useEventStore";
import { Event } from "@/types/event";
import { useEventRequests } from "@/hooks/useEventRequest";

const EventCardSkeleton = () => (
    <View style={[styles.eventCard, styles.skeletonCard]}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonContent}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonDate} />
            <View style={styles.skeletonParticipants} />
        </View>
        <View style={styles.skeletonStatus} />
    </View>
);

const EventCard = React.memo(({ event, onPress }: { event: Event; onPress: (event: Event) => void }) => {
    const participantCount = event.participants?.length || 0;
    const wineCount = event.wines?.length || 0;

    return (
        <TouchableOpacity style={styles.eventCard} onPress={() => onPress(event)} activeOpacity={0.7}>
            {event.image ? (
                <Image source={{ uri: event.image }} style={styles.eventImage} />
            ) : (
                <View style={styles.eventImagePlaceholder}>
                    <Text style={styles.placeholderText}>🍷</Text>
                </View>
            )}

            <View style={styles.eventContent}>
                <Text style={styles.eventName} numberOfLines={2}>
                    {event.name}
                </Text>
                <Text style={styles.eventDate}>{new Date(event.dateStart).toLocaleDateString("pt-BR")}</Text>
                <View style={styles.eventStats}>
                    <Text style={styles.statText}>
                        {participantCount} participante{participantCount !== 1 ? "s" : ""}
                    </Text>
                    <Text style={styles.statText}>
                        {wineCount} vinho{wineCount !== 1 ? "s" : ""}
                    </Text>
                </View>
            </View>

            <View style={[styles.statusBadge, styles[`status${event.status}`]]}>
                <Text style={styles.statusText}>
                    {event.status === "PLANNED" ? "Planejado" : event.status === "ONGOING" ? "Em Andamento" : event.status === "COMPLETED" ? "Concluído" : "Cancelado"}
                </Text>
            </View>
        </TouchableOpacity>
    );
});

const EventListComponent = () => {
    const { allEvents, isLoading, actions, selectors } = useEventStore((state) => ({
        allEvents: state.allEvents,
        isLoading: state.isLoading,
        actions: state.actions,
        selectors: state.selectors,
    }));

    const { fetchEventsPaginated } = useEventRequests();
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [lastDocId, setLastDocId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadInitialEvents = useCallback(async () => {
        if (allEvents.length > 0) return;

        try {
            setError(null);
            const result = await fetchEventsPaginated();
            setHasMore(result.hasMore);
            setLastDocId(result.lastDocId);
        } catch (err) {
            setError("Erro ao carregar eventos");
            console.error("Erro ao carregar eventos:", err);
        }
    }, [allEvents.length, fetchEventsPaginated]);

    const loadMoreEvents = useCallback(async () => {
        if (loadingMore || !hasMore || isLoading) return;

        try {
            setLoadingMore(true);
            const result = await fetchEventsPaginated(lastDocId || undefined);
            setHasMore(result.hasMore);
            setLastDocId(result.lastDocId);
        } catch (err) {
            setError("Erro ao carregar mais eventos");
            console.error("Erro ao carregar mais eventos:", err);
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, hasMore, isLoading, lastDocId, fetchEventsPaginated]);

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            setError(null);
            useEventStore.getState().clearCache();
            const result = await fetchEventsPaginated();
            setHasMore(result.hasMore);
            setLastDocId(result.lastDocId);
        } catch (err) {
            setError("Erro ao atualizar eventos");
        } finally {
            setRefreshing(false);
        }
    }, [fetchEventsPaginated]);

    const groupedEvents = useMemo(() => {
        const groups = {
            ONGOING: [] as Event[],
            PLANNED: [] as Event[],
            COMPLETED: [] as Event[],
            CANCELLED: [] as Event[],
        };

        allEvents.forEach((event) => {
            if (groups[event.status]) {
                groups[event.status].push(event);
            }
        });

        return groups;
    }, [allEvents]);

    const renderEventSection = (title: string, events: Event[], showSkeleton: boolean) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {showSkeleton ? (
                <View>
                    {[1, 2, 3].map((i) => (
                        <EventCardSkeleton key={i} />
                    ))}
                </View>
            ) : events.length > 0 ? (
                events.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onPress={(event) => {
                            console.log("Abrir evento:", event.id);
                        }}
                    />
                ))
            ) : (
                <View style={styles.emptySection}>
                    <Text style={styles.emptyText}>Nenhum evento encontrado</Text>
                </View>
            )}
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;

        return (
            <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color="#8B0000" />
                <Text style={styles.loadingText}>Carregando mais eventos...</Text>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🍷</Text>
            <Text style={styles.emptyStateTitle}>Nenhum evento encontrado</Text>
            <Text style={styles.emptyStateSubtitle}>{isLoading ? "Carregando eventos..." : "Crie seu primeiro evento de degustação!"}</Text>
            {!isLoading && (
                <TouchableOpacity style={styles.createEventButton}>
                    <Text style={styles.createEventButtonText}>Criar Evento</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (error && allEvents.length === 0) {
        return (
            <View style={styles.errorState}>
                <Text style={styles.errorEmoji}>😞</Text>
                <Text style={styles.errorTitle}>Erro ao carregar eventos</Text>
                <Text style={styles.errorSubtitle}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadInitialEvents}>
                    <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={[]}
                renderItem={null}
                keyExtractor={() => "section"}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#8B0000"]} tintColor={"#8B0000"} />}
                onEndReached={loadMoreEvents}
                onEndReachedThreshold={0.3}
                ListHeaderComponent={
                    <View>
                        {renderEventSection("Em Andamento", groupedEvents.ONGOING, isLoading && allEvents.length === 0)}

                        {renderEventSection("Próximos Eventos", groupedEvents.PLANNED, isLoading && allEvents.length === 0)}

                        {(groupedEvents.COMPLETED.length > 0 || isLoading) && renderEventSection("Eventos Concluídos", groupedEvents.COMPLETED, false)}
                    </View>
                }
                ListFooterComponent={renderFooter}
                ListEmptyComponent={allEvents.length === 0 && !isLoading ? renderEmptyState : null}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />

            {isLoading && allEvents.length === 0 && (
                <View style={styles.initialLoading}>
                    <ActivityIndicator size="large" color="#8B0000" />
                    <Text style={styles.initialLoadingText}>Carregando eventos...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    listContent: {
        flexGrow: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#2c3e50",
        marginBottom: 12,
        marginLeft: 8,
    },
    eventCard: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    skeletonCard: {
        opacity: 0.7,
    },
    eventImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    eventImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: "#e9ecef",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    placeholderText: {
        fontSize: 24,
    },
    eventContent: {
        flex: 1,
    },
    eventName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2c3e50",
        marginBottom: 4,
    },
    eventDate: {
        fontSize: 14,
        color: "#6c757d",
        marginBottom: 6,
    },
    eventStats: {
        flexDirection: "row",
        gap: 12,
    },
    statText: {
        fontSize: 12,
        color: "#8B0000",
        fontWeight: "500",
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    statusPLANNED: {
        backgroundColor: "#fff3cd",
    },
    statusONGOING: {
        backgroundColor: "#d1ecf1",
    },
    statusCOMPLETED: {
        backgroundColor: "#d4edda",
    },
    statusCANCELLED: {
        backgroundColor: "#f8d7da",
    },
    statusText: {
        fontSize: 10,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    // Skeleton styles
    skeletonImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: "#e9ecef",
        marginRight: 12,
    },
    skeletonContent: {
        flex: 1,
    },
    skeletonTitle: {
        height: 16,
        backgroundColor: "#e9ecef",
        borderRadius: 4,
        marginBottom: 8,
        width: "70%",
    },
    skeletonDate: {
        height: 12,
        backgroundColor: "#e9ecef",
        borderRadius: 4,
        marginBottom: 6,
        width: "50%",
    },
    skeletonParticipants: {
        height: 12,
        backgroundColor: "#e9ecef",
        borderRadius: 4,
        width: "40%",
    },
    skeletonStatus: {
        width: 60,
        height: 20,
        backgroundColor: "#e9ecef",
        borderRadius: 10,
    },
    // Loading states
    footerLoading: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        gap: 8,
    },
    loadingText: {
        color: "#6c757d",
        fontSize: 14,
    },
    initialLoading: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(248, 249, 250, 0.9)",
        gap: 12,
    },
    initialLoadingText: {
        color: "#6c757d",
        fontSize: 16,
    },
    // Empty state
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyStateEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#2c3e50",
        marginBottom: 8,
        textAlign: "center",
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: "#6c757d",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 20,
    },
    createEventButton: {
        backgroundColor: "#8B0000",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    createEventButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
    },
    emptySection: {
        alignItems: "center",
        padding: 20,
    },
    emptyText: {
        color: "#6c757d",
        fontSize: 14,
        fontStyle: "italic",
    },
    // Error state
    errorState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    errorEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#dc3545",
        marginBottom: 8,
        textAlign: "center",
    },
    errorSubtitle: {
        fontSize: 14,
        color: "#6c757d",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: "#8B0000",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
    },
});

export default React.memo(EventListComponent);
