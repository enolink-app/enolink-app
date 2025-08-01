import React, { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { Box, Text, ScrollView, Heading, Image, HStack, VStack, Button, Badge, BadgeText, ButtonText } from "@gluestack-ui/themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, ShareIcon, Copy, SettingsIcon, Star } from "lucide-react-native";
import { Share } from "react-native";
import { config } from "@/gluestack-ui.config";
import { useEventStore } from "@/stores/useEventStore";
import { useEventRoom } from "@/hooks/useEventRoom";
import { auth } from "@/lib/firebase";
import * as Clipboard from "expo-clipboard";
import { Alert } from "react-native";
import { useEventParticipants } from "@/hooks/useEventParticipants";
export default function EventRoomScreen() {
    const router = useRouter();
    const { id: eventId } = useLocalSearchParams<{ id: string }>();
    const { newParticipants, resetNewParticipants } = useEventParticipants(eventId);
    const { currentEvent, rankings, myEvaluations, isLoading } = useEventStore();
    useEventRoom(eventId);

    const primary = config.tokens.colors.primary["500"];
    const textLight = config.tokens.colors.textLight;
    const currentUserId = auth.currentUser?.uid;

    const isOrganizer = currentEvent?.organizerId === currentUserId;
    const isParticipant = currentEvent?.participants?.some((p) => p.id === currentUserId);

    // Função para verificar se o usuário já avaliou um vinho específico
    const userAlreadyEvaluated = (wineId: string) => {
        return myEvaluations.some((ev) => ev.wineId === wineId);
    };

    useFocusEffect(
        useCallback(() => {
            resetNewParticipants();
            return () => {};
        }, [])
    );

    // Função para verificar se um vinho está desbloqueado para avaliação
    const isWineUnlocked = (index: number): boolean => {
        // Se for o primeiro vinho, sempre está desbloqueado
        if (index === 0) return true;

        // Verifica se todos os participantes avaliaram o vinho anterior
        const previousWineId = currentEvent?.wines[index - 1]?.id;
        if (!previousWineId) return false;

        // Verifica se todos os participantes avaliaram o vinho anterior
        const allParticipantsEvaluated = currentEvent?.participants.every((participant) => {
            return participant.evaluations?.some((evaluation) => evaluation.wineId === previousWineId);
        });

        return allParticipantsEvaluated || false;
    };

    // Função para verificar se o usuário pode avaliar um vinho específico
    const canEvaluateWine = (wineId: string, index: number): boolean => {
        // Organizadores podem avaliar todos os vinhos a qualquer momento
        if (isOrganizer) return true;

        // Verifica se o vinho está desbloqueado e se o usuário ainda não avaliou
        return isWineUnlocked(index) && !userAlreadyEvaluated(wineId);
    };

    const handleSelectWine = (wineId: string, index: number) => {
        if (canEvaluateWine(wineId, index)) {
            router.push(`/(forms)/${wineId}/rating?index=${index}&eventId=${eventId}&wineId=${wineId}`);
        }
    };

    // Restante do código permanece o mesmo...
    const handleCopyInviteLink = async () => {
        if (!currentEvent?.inviteCode) return;
        const inviteLink = `https://yourapp.com/join/${currentEvent.inviteCode}`;
        await Clipboard.setStringAsync(inviteLink);
        Alert.alert("Link copiado!", "Compartilhe com os participantes");
    };

    const handleShareInvite = async () => {
        if (!currentEvent?.inviteCode) return;
        const inviteLink = `https://yourapp.com/join/${currentEvent.inviteCode}`;
        try {
            await Share.share({
                message: `Você foi convidado para o evento ${currentEvent.name}! Acesse: ${inviteLink}`,
                title: "Convite para Evento",
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    const handleLeaveEvent = async () => {
        Alert.alert("Sair do Evento", "Tem certeza que deseja sair deste evento?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Sair",
                onPress: () => {
                    router.back();
                },
            },
        ]);
    };

    const getWineImage = (image: number | string) => {
        if (typeof image === "number") {
            return image;
        }
        return { uri: image };
    };

    return (
        <Box flex={1} bg="$backgroundLight" p="$4" pt={50}>
            <HStack alignItems="center" mb="$4">
                <ChevronLeft color={textLight} size={32} onPress={() => router.back()} />
                <Heading size="lg" ml="$2">
                    {currentEvent?.name || "Evento"}
                </Heading>
                {isOrganizer && (
                    <HStack ml="auto" space="sm">
                        <Button variant="link" onPress={() => router.push(`/tabs/${eventId}/settings`)}>
                            <SettingsIcon size={20} color={primary} />
                        </Button>
                    </HStack>
                )}
                {newParticipants > 0 && (
                    <Badge ml="$2" bg="$green500" borderRadius="$full">
                        <BadgeText>+{newParticipants}</BadgeText>
                    </Badge>
                )}
            </HStack>

            {isLoading ? (
                <Text>Carregando...</Text>
            ) : (
                <>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} mb="$4">
                        <HStack space="md">
                            {currentEvent?.wines?.map((wine, index) => {
                                const canEvaluate = canEvaluateWine(wine.id, index);
                                const alreadyEvaluated = userAlreadyEvaluated(wine.id);
                                const isUnlocked = isWineUnlocked(index);

                                return (
                                    <Button
                                        key={wine.id}
                                        onPress={() => handleSelectWine(wine.id, index)}
                                        isDisabled={!canEvaluate}
                                        bg={alreadyEvaluated ? "$muted200" : isUnlocked ? "$white" : "$muted100"}
                                        h={150}
                                        w={150}
                                        borderRadius="$lg"
                                        alignItems="center"
                                        justifyContent="center"
                                        shadow="$2"
                                        m="$2"
                                        opacity={isUnlocked ? 1 : 0.7}
                                    >
                                        <VStack alignItems="center" space="sm">
                                            <Image
                                                source={getWineImage(wine.image)}
                                                alt={wine.name}
                                                w={80}
                                                h={100}
                                                borderRadius={6}
                                                resizeMode="cover"
                                                opacity={isUnlocked ? 1 : 0.5}
                                            />
                                            <Text fontWeight="$bold" fontSize="$sm" textAlign="center">
                                                {wine.name.length > 15 ? `${wine.name.slice(0, 15)}...` : wine.name}
                                            </Text>
                                            {alreadyEvaluated ? (
                                                <Text color="$muted" fontSize="$xs">
                                                    ✅ Avaliado
                                                </Text>
                                            ) : !isUnlocked ? (
                                                <Text color="$muted" fontSize="$xs">
                                                    🔒 Bloqueado
                                                </Text>
                                            ) : null}
                                        </VStack>
                                    </Button>
                                );
                            })}
                        </HStack>
                    </ScrollView>

                    <Box bg="$primary100" p="$4" borderRadius="$lg" mt="$2">
                        <Text color="$textLight">
                            🍷 Clique no vinho liberado para avaliar. Os próximos serão habilitados após todos os participantes enviarem suas avaliações.
                        </Text>
                    </Box>
                    {isParticipant && (
                        <Button variant="outline" borderColor="$red500" mt="$4" onPress={handleLeaveEvent}>
                            <ButtonText color="$red500">Sair do Evento</ButtonText>
                        </Button>
                    )}
                </>
            )}
        </Box>
    );
}
