// hooks/useInitialURL.ts
import { useEffect, useState } from "react";
import { Linking } from "react-native";

export function useInitialURL() {
    const [url, setUrl] = useState<string | null>(null);
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        const getUrlAsync = async () => {
            const initialUrl = await Linking.getInitialURL();
            setUrl(initialUrl);
            setProcessing(false);
        };

        getUrlAsync();

        const listener = Linking.addEventListener("url", ({ url }) => {
            setUrl(url);
        });

        return () => {
            listener.remove();
        };
    }, []);

    return { url, processing };
}
