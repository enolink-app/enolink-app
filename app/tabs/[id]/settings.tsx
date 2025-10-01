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
    Spinner,
    Center,
} from "@gluestack-ui/themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";
import { useRequest } from "@/hooks/useRequest";
import { ChevronLeft, ShareIcon, Copy, ArrowUpAZ, Medal, Wine } from "lucide-react-native";
import { auth } from "@/lib/firebase";
import { config } from "@/gluestack-ui.config";
import { useEventStore } from "@/stores/useEventStore";
import { Alert } from "react-native";
import * as Sharing from "expo-sharing";
import { generateInviteLink } from "@/services/invite";
import { useEventRoom } from "@/hooks/useEventRoom";
import useLanguageStore from "@/stores/useLanguageStore";
import { Platform } from "react-native";

const LoadingScreen = () => {
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];

    return (
        <Center flex={1} bg="$background" px="$4">
            <VStack space="xl" alignItems="center">
                <Box animation="bounce" iterationCount="infinite" style={{ transform: [{ scale: 1.2 }] }}>
                    <Wine size={64} color={primary} />
                </Box>
                <VStack space="md" alignItems="center">
                    <Spinner size="large" color={primary} />
                    <Text fontSize="$lg" color="$textLight" textAlign="center">
                        Carregando detalhes do evento...
                    </Text>
                </VStack>
            </VStack>
        </Center>
    );
};

export default function EventDetailsScreen() {
    const router = useRouter();
    const { id: eventId } = useLocalSearchParams<{ id: string }>();
    const { currentEvent, rankings, myEvaluations, isLoading, refreshEventData } = useEventStore();
    useEventRoom(eventId);
    const { getEventById, generateNewInviteCode } = useRequest();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [closingEvent, setClosingEvent] = useState(false); // Estado específico para fechamento
    const [isOpen, setIsOpen] = useState(false);
    const { closeEvent } = useRequest();
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);

    // Este useEffect será executado apenas quando forceUpdate mudar
    useEffect(() => {
        // Força a re-renderização do componente criando uma nova chave
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);
    const currentUserId = auth.currentUser?.uid;
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];
    const textLight = config.tokens.colors.textLight;

    useEffect(() => {
        const loadEvent = async () => {
            try {
                const eventData = await getEventById(eventId);
                setEvent(eventData);
            } catch (error) {
                console.error("Error loading currentEvent:", error);
            } finally {
                setLoading(false);
            }
        };

        loadEvent();
    }, [eventId]);

    const handleCopyInviteLink = async () => {
        if (!currentEvent) return;
        const inviteMessage = `${t("general.linkEvent")} *${currentEvent.name}* \n https://invite-enolink.online/e/join/${eventId}`;

        await Clipboard.setStringAsync(inviteMessage);
        alert(t("general.copied"));
    };

    const handleShareInvite = async () => {
        if (!currentEvent) return;
        const inviteLink = `https://invite-enolink.online/e/join/${eventId}`;
        // const link = generateInviteLink(currentEvent.inviteCode);

        await Share.share({
            message: `${t("general.linkEvent")} *${currentEvent.name}* \n\n ${inviteLink}`,
            title: `${t("general.linkEventTitle")}`,
            url: inviteLink,
        });
    };

    const handleGenerateNewCode = async () => {
        try {
            const newCode = await generateNewInviteCode(eventId, currentUserId);
            setEvent({ ...currentEvent, inviteCode: newCode });
            alert("Novo código gerado com sucesso!");
        } catch (error) {
            console.error("Error generating new code:", error);
            alert("Erro ao gerar novo código");
        }
    };

    const handleCloseEvent = async () => {
        setClosingEvent(true); // Ativa o estado específico de fechamento
        try {
            await closeEvent(eventId);
            await refreshEventData(eventId);
            Alert.alert("Sucesso", "Evento encerrado com sucesso!");
            router.push("/tabs/(tabs)/home");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível encerrar o evento");
        } finally {
            setClosingEvent(false);
            setIsOpen(false);
            router.push("/tabs/events");
        }
    };

    if (loading) return <LoadingScreen />;

    if (closingEvent) {
        return (
            <Center flex={1} bg="rgba(0, 0, 0, 0.5)" position="absolute" top={0} left={0} right={0} bottom={0} zIndex={999}>
                <VStack space="xl" alignItems="center" bg="$background" p="$6" rounded="$lg">
                    <Spinner size="large" color={primary} />
                    <Text fontSize="$lg" color="$textDark">
                        Encerrando evento...
                    </Text>
                </VStack>
            </Center>
        );
    }

    const isOrganizer = currentEvent?.organizerId === currentUserId;

    return (
        <Box key={updateKey} p="$4" mt={Platform.OS == "ios" ? 50 : 0}>
            <HStack>
                <ChevronLeft key="half" size={30} style={{ marginRight: 6 }} color={config.tokens.colors.textLight} onPress={() => router.back()} />
                <Text fontSize="$2xl" fontWeight="$bold" mb="$4">
                    {currentEvent?.name}
                </Text>
            </HStack>

            {isOrganizer && (
                <VStack space="md" mb="$8">
                    <Text fontWeight="$bold">{t("settings.invite")}</Text>
                    <HStack alignItems="center">
                        <Text fontSize="$lg" mx={12} fontWeight="$bold">{`https://invite-enolink.online/e/join/${eventId}`}</Text>
                        <Button variant="link" onPress={handleCopyInviteLink}>
                            <Copy size={20} color={primary} />
                        </Button>
                    </HStack>

                    <Button variant="solid" backgroundColor={primary} onPress={handleShareInvite}>
                        <ButtonText mx={12}>{t("settings.share")}</ButtonText>
                        <ShareIcon size={20} color="white" />
                    </Button>
                    <Button variant="solid" backgroundColor={primary} onPress={() => router.push(`/tabs/${eventId}/ranking`)}>
                        <ButtonText mx={12}>Ranking</ButtonText>
                        <Medal size={20} color={"#f2b71f"} />
                    </Button>
                    <Button variant="outline" borderColor="red" onPress={handleCloseEvent}>
                        <ButtonText color="red">{t("settings.finish")}</ButtonText>
                    </Button>
                </VStack>
            )}

            <Text>
                {t("settings.participants")}: {currentEvent?.participants?.length}
            </Text>
        </Box>
    );
}
