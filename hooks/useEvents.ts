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

    const loadEvents = useCallback(async () => {
        try {
            setIsLoading(true);
            const events = await getAllEvents();
            setAllEvents(events);
        } catch (error) {
            console.error("Failed to load events:", error);
        } finally {
            setIsLoading(false);
        }
    }, [getAllEvents, setAllEvents, setIsLoading]);

    const loadLocation = useCallback(async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });
    }, []);

    const getSortedEvents = useCallback(() => {
        if (!userLocation || !allEvents || allEvents.length === 0) return allEvents;

        return [...allEvents].sort((a, b) => {
            if (!a.location || !b.location) return 0;

            const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.location.latitude, a.location.longitude);
            const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.location.latitude, b.location.longitude);

            return distA - distB;
        });
    }, [allEvents, userLocation]);

    useEffect(() => {
        loadLocation();
    }, [loadLocation]);

    useEffect(() => {
        if (allEvents.length === 0 && !isLoading) {
            loadEvents();
        }
    }, [allEvents.length, isLoading, loadEvents]);

    return {
        events: getSortedEvents(),
        isLoading,
        refreshEvents: loadEvents,
        userLocation,
    };
};
