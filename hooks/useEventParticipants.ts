import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEventStore } from "@/stores/useEventStore";

export const useEventParticipants = (eventId: string) => {
    const [newParticipants, setNewParticipants] = useState(0);
    const { currentEvent, setCurrentEvent } = useEventStore();

    useEffect(() => {
        if (!eventId) return;

        const eventRef = doc(db, "events", eventId);
        const unsubscribe = onSnapshot(eventRef, (doc) => {
            const eventData = doc.data();
            if (eventData) {
                const previousCount = currentEvent?.participants?.length || 0;
                const currentCount = eventData.participants?.length || 0;

                if (currentCount > previousCount) {
                    setNewParticipants(currentCount - previousCount);
                }

                setCurrentEvent({ ...eventData, id: doc.id } as any);
            }
        });

        return () => unsubscribe();
    }, [eventId]);

    const resetNewParticipants = () => setNewParticipants(0);

    return { newParticipants, resetNewParticipants };
};
