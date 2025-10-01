import * as Location from "expo-location";
import { useState, useEffect } from "react";
import { Alert } from "react-native";

export const useLocation = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permissão para acessar localização foi negada");
                setIsLoading(false);
                return;
            }

            try {
                let location = await Location.getCurrentPositionAsync({});
                setLocation(location);
            } catch (error) {
                setErrorMsg("Erro ao obter localização");
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    return { location, errorMsg, isLoading };
};
