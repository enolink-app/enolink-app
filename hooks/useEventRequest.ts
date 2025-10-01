import { useCallback } from "react";
import { useEventStore } from "@/stores/useEventStore";
import { useRequest } from "./useRequest";

export const useEventsRequest = () => {
    const { allEvents, isLoading, setAllEvents, setIsLoading } = useEventStore();

    const { getAllEvents, getEventByUser } = useRequest();

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const events = await getAllEvents();
            setAllEvents(events);
            return events;
        } finally {
            setIsLoading(false);
        }
    }, [getAllEvents, setAllEvents, setIsLoading]);

    const fetchUserEvents = useCallback(async () => {
        try {
            const userEvents = await getEventByUser();
            return userEvents || [];
        } catch (error) {
            console.error("Erro ao carregar eventos do usuário:", error);
            return [];
        }
    }, [getEventByUser]);

    return {
        events: allEvents,
        isLoading,

        fetchEvents,
        fetchUserEvents,

        refreshEvents: fetchEvents,
    };
};
