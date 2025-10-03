import { useEffect } from "react";
import { useEventStore } from "../stores/useEventStore";
import { auth } from "../lib/firebase";
import { useRequest } from "./useRequest";

export const useEventRoom = (eventId: string) => {
    const { setCurrentEvent, setRankings, setMyEvaluations, setIsLoading } = useEventStore();
    const { getEventById, getRanking, getEvaluationsByEvent } = useRequest();

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                setIsLoading(true);
                const event = await getEventById(eventId);

                const eventWithWineIds = {
                    ...event,
                    wines: event?.wines
                        ? event.wines.map((wine: any, index: number) => ({
                              ...wine,
                              id: wine.id || `wine-${index}-${Date.now()}`,
                          }))
                        : [],
                };

                const rankings = await getRanking(eventId);
                const myEvaluations = await getEvaluationsByEvent(eventId);

                setCurrentEvent(eventWithWineIds);
                setRankings(rankings);
                setMyEvaluations(myEvaluations);
            } catch (error) {
                console.log(eventId, "event id no fetchEventData");
                console.error("Error fetching event data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (eventId) {
            fetchEventData();
        }
    }, [eventId]);
};
