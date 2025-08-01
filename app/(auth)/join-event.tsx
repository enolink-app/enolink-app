import { useLocalSearchParams, router } from "expo-router";
import { useEffect } from "react";
import { api } from "@/lib/axios";
import { Box, Text, Button, ButtonText } from "@gluestack-ui/themed";
import { auth } from "@/lib/firebase";
import { Alert } from "react-native";
export default function JoinEvent() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const currentUserId = auth.currentUser?.uid;

    const handleJoinEvent = async () => {
        try {
            await api.post(`/events/join`, {
                inviteCode: code,
                userId: currentUserId,
            });
            router.push("/tabs/events");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível entrar no evento");
        }
    };

    return (
        <Box flex={1} justifyContent="center" alignItems="center" p="$4">
            <Text mb="$4">Você foi convidado para participar de um evento!</Text>
            <Button onPress={handleJoinEvent}>
                <ButtonText>Participar do Evento</ButtonText>
            </Button>
        </Box>
    );
}
