// app/tabs/guest-join-event.tsx
import { Button, Text, Box, VStack, Input, InputField, ButtonText } from "@gluestack-ui/themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useRequest } from "@/hooks/useRequest";
import useLanguageStore from "@/stores/useLanguageStore";

export default function GuestJoinScreen() {
    const router = useRouter();
    const { inviteCode } = useLocalSearchParams<{ inviteCode: string }>();
    const { joinEvent } = useRequest();
    const [loading, setLoading] = useState(false);
    const [guestName, setGuestName] = useState("");
    const [updateKey, setUpdateKey] = useState(0);
    const { t, forceUpdate } = useLanguageStore();

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

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
        <Box key={updateKey} p="$4">
            <Text fontSize="$xl" mb="$4">
                {t("guestJoinEvent.join")}
            </Text>

            <Input mb="$4">
                <InputField placeholder={t("guestJoinEvent.name")} value={guestName} onChangeText={setGuestName} />
            </Input>

            <Button onPress={handleJoinAsGuest} isDisabled={loading}>
                <ButtonText>{loading ? t("guestJoinEvent.loadingSubmit") : t("guestJoinEvent.submit")}</ButtonText>
            </Button>
        </Box>
    );
}
