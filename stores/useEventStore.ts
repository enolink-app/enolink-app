import { create } from "zustand";
import { useRequest } from "@/hooks/useRequest";
import { auth } from "@/lib/firebase";
// Tipos de dados
interface Wine {
    id: string;
    name: string;
    country: string;
    type: string;
    description: string;
    harvest: string;
    image: number | string;
}

interface Evaluation {
    wineId: string;
    userId: string;
    aroma: number;
    flavor: number;
    color: number;
    notes?: string;
    createdAt: Date;
}

interface Participant {
    id: string;
    name: string;
    isGuest: boolean;
    joinedAt: Date;
    evaluations?: Evaluation[];
}

interface EventLocation {
    latitude: number;
    longitude: number;
    address?: string;
}

interface Event {
    id: string;
    name: string;
    organizerId: string;
    participants: Participant[];
    wines: Wine[];
    location?: EventLocation;
    inviteCode: string;
    status: "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED";
    createdAt: Date;
    updatedAt: Date;
}

interface Ranking {
    wineId: string;
    name: string;
    country: string;
    image: string;
    averageRating: number;
    totalEvaluations: number;
    lastUpdated: Date;
}

interface TopWine extends Ranking {
    description: string;
    type: string;
}

interface EventState {
    // Dados principais
    allEvents: Event[];
    currentEvent: Event | null;
    rankings: Ranking[];
    myEvaluations: Evaluation[];
    topWines: TopWine[];
    isLoading: boolean;

    // Sistema de cache
    eventsCache: Record<string, Event>;
    evaluationsCache: Record<string, Evaluation[]>;
    topWinesCache: TopWine[];

    // Setters básicos
    setAllEvents: (events: Event[]) => void;
    setCurrentEvent: (event: Event) => void;
    setRankings: (rankings: Ranking[]) => void;
    setMyEvaluations: (evaluations: Evaluation[]) => void;
    setTopWines: (wines: TopWine[]) => void;
    setIsLoading: (loading: boolean) => void;

    // Gerenciamento de cache
    addEventToCache: (event: Event) => void;
    getEventFromCache: (eventId: string) => Event | null;
    addEvaluationsToCache: (eventId: string, evaluations: Evaluation[]) => void;
    getEvaluationsFromCache: (eventId: string) => Evaluation[] | null;
    addTopWinesToCache: (wines: TopWine[]) => void;
    getTopWinesFromCache: () => TopWine[];
    clearCache: () => void;
    refreshEventData: (eventId: string) => Promise<void>;
    addEvaluation: (evaluation: Evaluation) => void;
    // Métodos para rankings
    updateWineRanking: (wineId: string, rating: number) => void;
    getTop10Wines: () => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
    // Estado inicial
    allEvents: [],
    currentEvent: null,
    rankings: [],
    myEvaluations: [],
    topWines: [],
    isLoading: true,
    eventsCache: {},
    evaluationsCache: {},
    topWinesCache: [],

    // Setters básicos
    setAllEvents: (events) => set({ allEvents: events }),
    setCurrentEvent: (event) => set({ currentEvent: event }),
    setRankings: (rankings) => set({ rankings }),
    setMyEvaluations: (evaluations) => set({ myEvaluations: evaluations }),
    setTopWines: (wines) => set({ topWines: wines }),
    setIsLoading: (isLoading) => set({ isLoading }),
    addEvaluation: (evaluation) =>
        set((state) => ({
            myEvaluations: [...state.myEvaluations, evaluation],
        })),
    // Sistema de cache de eventos
    addEventToCache: (event) =>
        set((state) => ({
            eventsCache: { ...state.eventsCache, [event.id]: event },
        })),

    getEventFromCache: (eventId) => {
        const cache = get().eventsCache;
        return cache[eventId] || null;
    },

    // Sistema de cache de avaliações
    addEvaluationsToCache: (eventId, evaluations) =>
        set((state) => ({
            evaluationsCache: { ...state.evaluationsCache, [eventId]: evaluations },
        })),

    getEvaluationsFromCache: (eventId) => {
        const cache = get().evaluationsCache;
        return cache[eventId] || null;
    },

    // Cache para top vinhos
    addTopWinesToCache: (wines) => set({ topWinesCache: wines }),
    getTopWinesFromCache: () => get().topWinesCache,

    // Limpeza de cache
    clearCache: () =>
        set({
            eventsCache: {},
            evaluationsCache: {},
            topWinesCache: [],
        }),

    // Métodos para rankings
    updateWineRanking: (wineId, rating) => {
        set((state) => {
            const updatedRankings = state.rankings.map((ranking) =>
                ranking.wineId === wineId
                    ? {
                          ...ranking,
                          averageRating: (ranking.averageRating * ranking.totalEvaluations + rating) / (ranking.totalEvaluations + 1),
                          totalEvaluations: ranking.totalEvaluations + 1,
                          lastUpdated: new Date(),
                      }
                    : ranking
            );

            return { rankings: updatedRankings };
        });
    },

    getTop10Wines: async () => {
        try {
            set({ isLoading: true });
            const { getTopWines, getEventById } = useRequest();
            const topWines = await getTopWines();

            set({
                topWines,
                topWinesCache: topWines,
                isLoading: false,
            });
        } catch (error) {
            console.error("Failed to fetch top wines:", error);
            set({ isLoading: false });
        }
    },
    refreshEventData: async (eventId: string) => {
        const { getTopWines, getEventById } = useRequest();
        try {
            set({ isLoading: true });

            // Aqui você deve implementar a lógica para buscar os dados atualizados do evento
            // Exemplo:
            const response = await getEventById(eventId);
            const eventData = await response;

            set({
                currentEvent: eventData,
                myEvaluations: eventData.participants?.find((p) => p.id === auth.currentUser?.uid)?.evaluations || [],
            });
        } catch (error) {
            console.error("Erro ao atualizar dados do evento:", error);
        } finally {
            set({ isLoading: false });
        }
    },
}));

// Hook personalizado para uso conveniente
export const useEventCache = () => {
    const { addEventToCache, getEventFromCache, addEvaluationsToCache, getEvaluationsFromCache, addTopWinesToCache, getTopWinesFromCache, clearCache, getTop10Wines } =
        useEventStore();

    return {
        cacheEvent: addEventToCache,
        getCachedEvent: getEventFromCache,
        cacheEvaluations: addEvaluationsToCache,
        getCachedEvaluations: getEvaluationsFromCache,
        cacheTopWines: addTopWinesToCache,
        getCachedTopWines: getTopWinesFromCache,
        clearEventCache: clearCache,
        refreshTopWines: getTop10Wines,
    };
};
