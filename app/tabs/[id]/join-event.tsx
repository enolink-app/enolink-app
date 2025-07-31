import { Button, Text, Box, VStack, ButtonText } from "@gluestack-ui/themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useRequest } from "@/hooks/useRequest";
import { auth } from "@/lib/firebase";

export default function JoinEventScreen() {
    const router = useRouter();
    const { inviteCode } = useLocalSearchParams<{ inviteCode: string }>();
    const { joinEvent } = useRequest();
    const [loading, setLoading] = useState(false);
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (!inviteCode) {
            router.push("/tabs/(tabs)/home");
        }
    }, [inviteCode]);

    const handleJoinEvent = async () => {
        if (!currentUser) {
            router.push(`/tabs/guest-join-event?inviteCode=${inviteCode}`);
            return;
        }

        setLoading(true);
        try {
            const result = await joinEvent(inviteCode, {
                userId: currentUser.uid,
                userName: currentUser.displayName || "Usuário",
            });

            router.push(`/tabs/${result.eventId}/event-room`);
        } catch (error) {
            console.error("Error joining event:", error);
            alert("Erro ao entrar no evento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p="$4">
            <Text fontSize="$xl" mb="$4">
                Você foi convidado para um evento!
            </Text>

            <Button onPress={handleJoinEvent} isDisabled={loading}>
                <ButtonText>{loading ? "Entrando..." : "Entrar no Evento"}</ButtonText>
            </Button>
        </Box>
    );
}
