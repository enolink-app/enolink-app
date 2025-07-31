// app/tabs/guest-join-event.tsx
import { Button, Text, Box, VStack, Input, InputField, ButtonText } from "@gluestack-ui/themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useRequest } from "@/hooks/useRequest";

export default function GuestJoinScreen() {
    const router = useRouter();
    const { inviteCode } = useLocalSearchParams<{ inviteCode: string }>();
    const { joinEvent } = useRequest();
    const [loading, setLoading] = useState(false);
    const [guestName, setGuestName] = useState("");

    const handleJoinAsGuest = async () => {
        if (!guestName.trim()) {
            alert("Por favor, informe seu nome");
            return;
        }

        setLoading(true);
        try {
            const result = await joinEvent(inviteCode, {
                userId: `guest-${Date.now()}`,
                userName: guestName,
                isGuest: true,
            });

            router.push(`/tabs/event-room/${result.eventId}`);
        } catch (error) {
            console.error("Error joining as guest:", error);
            alert("Erro ao entrar como convidado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p="$4">
            <Text fontSize="$xl" mb="$4">
                Entrar como Convidado
            </Text>

            <Input mb="$4">
                <InputField placeholder="Seu nome" value={guestName} onChangeText={setGuestName} />
            </Input>

            <Button onPress={handleJoinAsGuest} isDisabled={loading}>
                <ButtonText>{loading ? "Entrando..." : "Entrar no Evento"}</ButtonText>
            </Button>
        </Box>
    );
}
