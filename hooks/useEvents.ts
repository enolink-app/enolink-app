// hooks/useEvents.ts
import { useEffect, useState, useCallback } from "react";
import { useEventStore } from "@/stores/useEventStore";
import { useRequest } from "./useRequest";
import { calculateDistance } from "@/services/geo";
import * as Location from "expo-location";

export const useEvents = () => {
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const { allEvents, setAllEvents, isLoading, setIsLoading } = useEventStore();
    const { getAllEvents } = useRequest();

    const loadEvents = async () => {
        console.log("3.0");
        try {
            console.log("3.1");
            setIsLoading(true);
            const events = await getAllEvents();
            console.log("3.2");
            setAllEvents(events);
            console.log("3.3");
        } catch (error) {
            console.log("3.e");
            console.error("Failed to load events:", error);
        } finally {
            console.log("3.4");
            setIsLoading(false);
        }
    };

    const loadLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });
    };

    const getSortedEvents = useCallback(() => {
        if (!userLocation || !allEvents) return allEvents;

        return [...allEvents].sort((a, b) => {
            if (!a.location || !b.location) return 0;

            const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.location.latitude, a.location.longitude);

            const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.location.latitude, b.location.longitude);

            return distA - distB;
        });
    }, [allEvents, userLocation]);

    useEffect(() => {
        loadLocation();
    }, []);

    useEffect(() => {
        if (allEvents.length == 0 && !isLoading) {
            loadEvents();
        }
    }, []);

    return {
        events: getSortedEvents(),
        isLoading,
        refreshEvents: loadEvents,
        userLocation,
    };
};
