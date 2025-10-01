import React, { useCallback, useState, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import {
    Box,
    Text,
    ScrollView,
    Heading,
    Image,
    HStack,
    VStack,
    Button,
    Badge,
    BadgeText,
    ButtonText,
    Divider,
    Pressable,
    Avatar,
    AvatarGroup,
    AvatarFallbackText,
    AvatarImage,
} from "@gluestack-ui/themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, ShareIcon, Copy, SettingsIcon, Star, Users, Wine, Lock, CheckCircle, Crown, Calendar } from "lucide-react-native";
import { Share } from "react-native";
import { config } from "@/gluestack-ui.config";
import { useEventStore } from "@/stores/useEventStore";
import { useEventRoom } from "@/hooks/useEventRoom";
import { auth } from "@/lib/firebase";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { useEventParticipants } from "@/hooks/useEventParticipants";
import useLanguageStore from "@/stores/useLanguageStore";
import { generateInviteLink } from "@/services/invite";

export default function EventRoomScreen() {
    const router = useRouter();
    const { id: eventId } = useLocalSearchParams<{ id: string }>();
    const { newParticipants, resetNewParticipants } = useEventParticipants(eventId);
    const { currentEvent, rankings, myEvaluations, isLoading } = useEventStore();
    const [updateKey, setUpdateKey] = useState(0);
    useEventRoom(eventId);
    const { t, forceUpdate } = useLanguageStore();

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];
    const textLight = config.tokens.colors.textLight;
    const currentUserId = auth.currentUser?.uid;

    const isOrganizer = currentEvent?.organizerId === currentUserId;
    const isParticipant = currentEvent?.participants?.some((p) => p.id === currentUserId);

    const userAlreadyEvaluated = (wineId: string) => {
        return myEvaluations.some((ev) => ev.wineId === wineId);
    };

    useFocusEffect(
        useCallback(() => {
            resetNewParticipants();
            return () => {};
        }, [])
    );

    const isWineUnlocked = (index: number): boolean => {
        if (index === 0) return true;

        const previousWineId = currentEvent?.wines[index - 1]?.id;
        if (!previousWineId) return false;

        const allParticipantsEvaluated = currentEvent?.participants.every((participant) => {
            return participant.evaluations?.some((evaluation) => evaluation.wineId === previousWineId);
        });

        return allParticipantsEvaluated || false;
    };

    const canEvaluateWine = (wineId: string, index: number): boolean => {
        if (isOrganizer) return true;

        return isWineUnlocked(index) && !userAlreadyEvaluated(wineId);
    };

    const handleSelectWine = (wineId: string, index: number) => {
        if (canEvaluateWine(wineId, index)) {
            router.push(`/(forms)/${wineId}/rating?index=${index}&eventId=${eventId}&wineId=${wineId}`);
        }
    };

    const handleCopyInviteLink = async () => {
        if (!currentEvent) return;
        const inviteMessage = `${t("general.linkEvent")} *${currentEvent.name}* \n https://invite-enolink.online/e/join/${eventId}`;

        await Clipboard.setStringAsync(inviteMessage);
        alert(t("general.copied"));
    };

    const handleShareInvite = async () => {
        if (!currentEvent) return;
        const inviteLink = `https://invite-enolink.online/e/join/${eventId}`;

        await Share.share({
            message: `${t("general.linkEvent")} *${currentEvent.name}* \n\n ${inviteLink}`,
            title: `${t("general.linkEventTitle")}`,
            url: inviteLink,
        });
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

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Box key={updateKey} flex={1} bg="$backgroundLight" w="$full" pt={50}>
            <Box
                bg={{
                    linearGradient: {
                        colors: [primary, "#8B0000"],
                        start: [0, 0],
                        end: [1, 0],
                    },
                }}
                w="$full"
                p="$4"
                pb="$6"
                borderBottomLeftRadius="$2xl"
                borderBottomRightRadius="$2xl"
                shadow="lg"
            >
                <HStack alignItems="center" justifyContent="space-between" mb="$4">
                    <HStack alignItems="center" flex={1}>
                        <Pressable onPress={() => router.push("/tabs/(tabs)/home")} p="$2" rounded="$full" bg="rgba(255,255,255,0.2)" mr="$3">
                            <ChevronLeft size={32} color={textLight} />
                        </Pressable>

                        <VStack flex={1}>
                            <Heading size="lg" color={textLight} numberOfLines={1}>
                                {currentEvent?.name || t("eventRoom.title")}
                            </Heading>
                            {currentEvent?.dateStart && (
                                <HStack alignItems="center" mt="$1">
                                    <Calendar size={14} color={textLight} />
                                    <Text color={textLight} fontSize="$sm" ml="$1">
                                        {formatEventDate(currentEvent.dateStart)}
                                    </Text>
                                </HStack>
                            )}
                        </VStack>
                    </HStack>

                    {isOrganizer && (
                        <Pressable onPress={() => router.push(`/tabs/${eventId}/settings`)} p="$2" rounded="$full" bg="rgba(255,255,255,0.2)">
                            <SettingsIcon size={32} color={textLight} />
                        </Pressable>
                    )}
                </HStack>

                <HStack justifyContent="space-between" alignItems="center">
                    <HStack alignItems="center">
                        <Users size={16} color={textLight} />
                        <Text color={textLight} fontSize="$sm" ml="$2">
                            {currentEvent?.participants?.length || 0} {t("eventRoom.participants")}
                        </Text>
                    </HStack>

                    <HStack space="sm">
                        <Pressable onPress={handleCopyInviteLink} p="$2" rounded="$full" bg="rgba(255,255,255,0.2)">
                            <Copy size={16} color={textLight} />
                        </Pressable>
                        <Pressable onPress={handleShareInvite} p="$2" rounded="$full" bg="rgba(255,255,255,0.2)">
                            <ShareIcon size={16} color={textLight} />
                        </Pressable>
                    </HStack>
                </HStack>
            </Box>

            {isLoading ? (
                <Box flex={1} justifyContent="center" alignItems="center">
                    <Text color="$textLight">{t("general.loading")}</Text>
                </Box>
            ) : (
                <ScrollView flex={1} p="$4">
                    {newParticipants > 0 && (
                        <Box bg="$green100" p="$3" borderRadius="$lg" mb="$4" borderLeftWidth={4} borderLeftColor="$green500">
                            <HStack alignItems="center">
                                <Text color="$green800" fontSize="$sm" fontWeight="$medium">
                                    🎉 {newParticipants} {t("eventRoom.newParticipant")}
                                </Text>
                            </HStack>
                        </Box>
                    )}

                    <VStack space="md" mb="$6">
                        <HStack alignItems="center" justifyContent="space-between">
                            <HStack alignItems="center">
                                <Wine size={20} color={primary} />
                                <Heading size="md" ml="$2">
                                    {t("eventRoom.winesForTasting")}
                                </Heading>
                            </HStack>
                            <Text color="$textLight" fontSize="$sm">
                                {currentEvent?.wines?.length || 0} {t("eventRoom.wines")}
                            </Text>
                        </HStack>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <HStack space="md" pb="$2">
                                {currentEvent?.wines?.map((wine, index) => {
                                    const canEvaluate = canEvaluateWine(wine.id, index);
                                    const alreadyEvaluated = userAlreadyEvaluated(wine.id);
                                    const isUnlocked = isWineUnlocked(index);

                                    return (
                                        <Pressable
                                            key={wine.id}
                                            onPress={() => handleSelectWine(wine.id, index)}
                                            disabled={!canEvaluate}
                                            w={160}
                                            h={200}
                                            bg={alreadyEvaluated ? "$muted100" : isUnlocked ? "white" : "$muted50"}
                                            borderRadius="$xl"
                                            alignItems="center"
                                            justifyContent="center"
                                            shadowColor="#000"
                                            shadowOffset={{ width: 0, height: 2 }}
                                            shadowOpacity={0.1}
                                            shadowRadius={4}
                                            mx="$1"
                                            opacity={isUnlocked ? 1 : 0.6}
                                            borderWidth={1}
                                            borderColor={alreadyEvaluated ? "$green300" : isUnlocked ? "$primary100" : "$muted200"}
                                            position="relative"
                                        >
                                            {/* Badge de status */}
                                            <Box position="absolute" top={-8} right={-8} zIndex={10}>
                                                {alreadyEvaluated ? (
                                                    <Box bg="$green500" p="$1" rounded="$full" shadow="md">
                                                        <CheckCircle size={16} color="white" />
                                                    </Box>
                                                ) : !isUnlocked ? (
                                                    <Box bg="$muted500" p="$1" rounded="$full" shadow="md">
                                                        <Lock size={16} color="white" />
                                                    </Box>
                                                ) : null}
                                            </Box>

                                            <VStack alignItems="center" space="sm" p="$3">
                                                <Box w={80} h={100} borderRadius="$lg" bg="$muted100" overflow="hidden" shadow="sm">
                                                    <Image
                                                        source={getWineImage(wine.image)}
                                                        alt={wine.name}
                                                        w="$full"
                                                        h="$full"
                                                        resizeMode="cover"
                                                        opacity={isUnlocked ? 1 : 0.7}
                                                    />
                                                </Box>

                                                <VStack alignItems="center" space="$1">
                                                    <Text fontWeight="$bold" fontSize="$sm" textAlign="center" numberOfLines={1}>
                                                        {wine.name}
                                                    </Text>
                                                    {wine.harvest && (
                                                        <Text color="$textLight" fontSize="$xs">
                                                            {t("eventRoom.harvest")} {wine.harvest}
                                                        </Text>
                                                    )}
                                                </VStack>

                                                {!isUnlocked && (
                                                    <Text color="$muted" fontSize="$xs" textAlign="center">
                                                        {t("eventRoom.wait")}
                                                    </Text>
                                                )}
                                            </VStack>
                                        </Pressable>
                                    );
                                })}
                            </HStack>
                        </ScrollView>
                    </VStack>

                    <VStack space="md" mb="$6">
                        <Heading size="md">{t("eventRoom.details")}</Heading>
                        <Box bg="$primary50" p="$4" borderRadius="$lg" borderLeftWidth={4} borderLeftColor={primary}>
                            <VStack space="sm">
                                <Text color="$textLight" fontSize="$sm">
                                    {t("eventRoom.typeWine")}
                                </Text>
                                <Text fontSize="$sm" color="$textLight">
                                    {t("eventRoom.typeWine2")}
                                </Text>
                            </VStack>
                        </Box>
                    </VStack>

                    <VStack space="md">
                        <Button variant="solid" bg={primary} onPress={() => router.push(`/tabs/${eventId}/ranking`)} borderRadius="$lg" h="$12">
                            <ButtonText>{t("eventRoom.seeRanking")}</ButtonText>
                            <Star size={16} color="white" style={{ marginLeft: 8 }} />
                        </Button>

                        <Button variant="outline" borderColor="$red300" onPress={handleLeaveEvent} borderRadius="$lg" h="$12">
                            <ButtonText color="$red500">{t("eventRoom.leave")}</ButtonText>
                        </Button>
                    </VStack>
                </ScrollView>
            )}
        </Box>
    );
}
