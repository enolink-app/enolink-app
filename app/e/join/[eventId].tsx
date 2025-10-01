import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useRequest } from "@/hooks/useRequest";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@/gluestack-ui.config";

export default function JoinEventScreen() {
    const { eventId } = useLocalSearchParams();
    const { joinEvent } = useRequest();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (loading) return;

        const handleDeepLink = async () => {
            try {
                if (!eventId || typeof eventId !== "string") {
                    setError("Código do evento inválido");
                    return;
                }

                if (user) {
                    const userData = {
                        userId: user.uid,
                        userName: user.displayName || "Usuário",
                        isGuest: false,
                    };

                    const success = await joinEvent(eventId, userData);
                    if (success) {
                        router.replace(`/tabs/${eventId}/event-room`);
                    } else {
                        setError("Falha ao entrar no evento");
                    }
                } else {
                    router.push({
                        pathname: "/login",
                        params: {
                            callback: JSON.stringify({
                                path: `/tabs/${eventId}/event-room`,
                                params: { eventId },
                            }),
                        },
                    });
                }
            } catch (err) {
                console.error("Error handling deep link:", err);
                setError("Erro ao processar o convite");
            }
        };

        handleDeepLink();
    }, [user, loading, eventId]);

    if (error) {
        return (
            <GluestackUIProvider config={config}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
                    <Text style={{ textAlign: "center", color: "red", fontSize: 16 }}>{error}</Text>
                    <Text style={{ textAlign: "center", marginTop: 10, fontSize: 14 }}>Volte ao app e tente novamente.</Text>
                </View>
            </GluestackUIProvider>
        );
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 10 }}>Entrando no evento...</Text>
        </View>
    );
}
