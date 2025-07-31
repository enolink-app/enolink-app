// screens/EventDetailsScreen.tsx
import {
    Button,
    Text,
    Box,
    HStack,
    VStack,
    ButtonText,
    Heading,
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
} from "@gluestack-ui/themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";
import { useRequest } from "@/hooks/useRequest";
import { ChevronLeft, ShareIcon, Copy, ArrowUpAZ, Medal } from "lucide-react-native";
import { auth } from "@/lib/firebase";
import { config } from "@/gluestack-ui.config";
import { useEventStore } from "@/stores/useEventStore";
import { Alert } from "react-native";
import * as Sharing from "expo-sharing";
import { generateInviteLink } from "@/services/invite";

export default function EventDetailsScreen() {
    const router = useRouter();
    const { id: eventId } = useLocalSearchParams<{ id: string }>();
    const { getEventById, generateNewInviteCode } = useRequest();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { closeEvent } = useRequest();
    const { refreshEventData } = useEventStore();
    const currentUserId = auth.currentUser?.uid;
    const primary = config.tokens.colors.primary["500"];
    const textLight = config.tokens.colors.textLight;

    useEffect(() => {
        const loadEvent = async () => {
            try {
                const eventData = await getEventById(eventId);
                setEvent(eventData);
            } catch (error) {
                console.error("Error loading event:", error);
            } finally {
                setLoading(false);
            }
        };

        loadEvent();
    }, [eventId]);

    const handleCopyInviteLink = async () => {
        if (!event) return;

        const inviteLink = `https://yourapp.com/join/${event.inviteCode}`;
        await Clipboard.setStringAsync(inviteLink);
        alert("Link copiado para a área de transferência!");
    };

    const handleShareInvite = async () => {
        if (!event) return;

        const inviteLink = `https://yourapp.com/join/${event.inviteCode}`;
        const link = generateInviteLink(event.inviteCode);
        Sharing.shareAsync(link, {
            dialogTitle: "Convite para Evento",
            subject: `Você foi convidado para o evento ${event.name}! Acesse: ${inviteLink}`,
        });
    };

    const handleGenerateNewCode = async () => {
        try {
            const newCode = await generateNewInviteCode(eventId, currentUserId);
            setEvent({ ...event, inviteCode: newCode });
            alert("Novo código gerado com sucesso!");
        } catch (error) {
            console.error("Error generating new code:", error);
            alert("Erro ao gerar novo código");
        }
    };

    const handleCloseEvent = async () => {
        try {
            await closeEvent(eventId);
            await refreshEventData(eventId);
            Alert.alert("Sucesso", "Evento encerrado com sucesso!");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível encerrar o evento");
        } finally {
            setIsLoading(false);
            setIsOpen(false);
            router.back();
        }
    };

    if (loading) return <Text>Carregando...</Text>;
    if (!event) return <Text>Evento não encontrado</Text>;

    const isOrganizer = event.organizerId === currentUserId;

    return (
        <Box p="$4" mt={50}>
            <HStack>
                <ChevronLeft color={textLight} size={32} onPress={() => router.back()} />
                <Text fontSize="$2xl" fontWeight="$bold" mb="$4">
                    {event.name}
                </Text>
            </HStack>

            {isOrganizer && (
                <VStack space="md" mb="$8">
                    <Text fontWeight="$bold">Convide participantes:</Text>
                    <HStack alignItems="center">
                        <Text fontSize="$lg" mx={12} fontWeight="$bold">{`https://enolink.com/join/${event.inviteCode}`}</Text>
                        <Button variant="link" onPress={handleCopyInviteLink}>
                            <Copy size={20} color={primary} />
                        </Button>
                        {/*                     <Button onPress={handleCopyInviteLink}>
                        <ButtonText>Copiar Link de Convite</ButtonText>
                    </Button> */}
                    </HStack>

                    <Button variant="solid" backgroundColor={primary} onPress={handleShareInvite}>
                        <ButtonText mx={12}>Compartilhar Convite</ButtonText>
                        <ShareIcon size={20} color="white" />
                    </Button>

                    <Button variant="solid" backgroundColor={primary} onPress={handleGenerateNewCode}>
                        <ButtonText mx={12}>Gerar Novo Código</ButtonText>
                        <ArrowUpAZ size={20} color={"white"} />
                    </Button>
                    <Button variant="solid" backgroundColor={primary} onPress={() => router.push(`/tabs/${eventId}/ranking`)}>
                        <ButtonText mx={12}>Ranking</ButtonText>
                        <Medal size={20} color={"#f2b71f"} />
                    </Button>
                    <Button variant="outline" borderColor="red" onPress={handleCloseEvent}>
                        <ButtonText color="red">Encerrar evento</ButtonText>
                    </Button>
                </VStack>
            )}

            <Text>Participantes: {event.participants.length}</Text>
        </Box>
    );
}
