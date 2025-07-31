import EditScreenInfo from "@/components/EditScreenInfo";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";

import { auth } from "@/lib/firebase";
import { useRouter } from "expo-router";
import { Settings } from "lucide-react-native";
import { Button, ButtonText, Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from "@gluestack-ui/themed";
import { Box, ScrollView, Text, HStack, Pressable, Divider } from "@gluestack-ui/themed";
import { useState, useEffect } from "react";
import { EventUserCard } from "@/components/EventUserCard";
import { events } from "@/constants/data";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { config } from "@/ui/gluestack-ui.config";
import { useRequest } from "@/hooks/useRequest";
import { onAuthStateChanged } from "firebase/auth";
import useLanguageStore from "@/stores/useLanguageStore";
function formatDate(dateInput: Date | string | number) {
    const date = new Date(dateInput);
    return dayjs(date).locale("pt-br").format("DD MMM · YYYY");
}

export default function Tab2() {
    const [selectedTab, setSelectedTab] = useState<"created" | "joined">("created");
    const [eventsUser, setEventsUser] = useState([]);
    const { getEventByUser } = useRequest();
    const router = useRouter();
    const [user, setUser] = useState(auth.currentUser);
    const { t } = useLanguageStore();

    useEffect(() => {
        setEvent();
    }, [0]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Recarrega o usuário para pegar os dados mais recentes
                await user.reload();
                setUser({ ...auth.currentUser });
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        setEvent();
    }, []);

    async function setEvent() {
        const response = await getEventByUser();
        setEventsUser(response);
    }

    const happeningNow = eventsUser.filter((event) => {
        const now = new Date();
        const start = new Date(event.dateStart);
        const end = event.dateEnd ? new Date(event.dateEnd) : null;

        return event.status === "STARTED" && start <= now && (!end || end > now);
    });

    const ended = eventsUser.filter((event) => {
        const now = new Date();
        const end = event.dateEnd ? new Date(event.dateEnd) : null;

        return event.status === "CLOSED" || end != null;
    });

    return (
        <Box flex={1} bg="$backgroundLight" p="$4" mt={50}>
            <Box mt={20} mb={50} flexDirection="row" justifyContent="space-between">
                <Text bold size="xl">
                    {t("me.title")}
                </Text>
                <Settings onPress={() => router.push("/(settings)/settings")} key="half" size={36} color={config.tokens.colors.textLight} />
            </Box>
            <Box justifyContent="center" alignItems="center">
                <Avatar size="2xl" my={3}>
                    <AvatarImage
                        source={
                            user?.photoURL
                                ? {
                                      uri: user?.photoURL,
                                  }
                                : require("../../../assets/images/placeholder.png")
                        }
                        alt="User avatar"
                    />
                </Avatar>
                <Box my={"$4"} alignItems="center">
                    <Text bold size="lg">
                        {user?.displayName || "User"}
                    </Text>
                    {/*                     <Text size="sm">@renzo123</Text>
                     */}
                </Box>
                <HStack justifyContent="space-evenly" w="$96">
                    <Button onPress={() => router.push("/(forms)/edit-profile")} variant="outline" borderRadius={24} borderColor={config.tokens.colors.primary?.["500"]}>
                        <ButtonText color={config.tokens.colors.primary?.["500"]}>{t("me.edit")}</ButtonText>
                    </Button>
                    <Button variant="solid" borderRadius={24} bg={config.tokens.colors.primary?.["500"]}>
                        <ButtonText color={config.tokens.colors.textDark}>{t("me.invite")}</ButtonText>
                    </Button>
                </HStack>
            </Box>
            <Box bg="$backgroundLight" p="$4" mt={50}>
                {/* Tabs */}
                <HStack space="lg" mb="$4">
                    <Pressable onPress={() => setSelectedTab("created")}>
                        <Text fontWeight="$bold" mb={6} color={selectedTab === "created" ? config.tokens.colors.primary?.["500"] : "$muted"}>
                            {t("me.created")}
                        </Text>
                        {selectedTab == "created" && <Divider className="my-1" bgColor={config.tokens.colors.primary?.["500"]} />}
                    </Pressable>

                    <Pressable onPress={() => setSelectedTab("joined")}>
                        <Text fontWeight="$bold" mb={6} color={selectedTab === "joined" ? config.tokens.colors.primary?.["500"] : "$muted"}>
                            {t("me.joined")}
                        </Text>
                        {selectedTab == "joined" && <Divider className="my-1" bgColor={config.tokens.colors.primary?.["500"]} />}
                    </Pressable>
                </HStack>

                <ScrollView showsVerticalScrollIndicator={false} horizontal>
                    {(selectedTab === "created" ? happeningNow : ended).map((event, index) => (
                        <EventUserCard
                            onPress={() => router.push(`/forms/[id]/ranking`)}
                            key={event.id || index}
                            image={event.wines[0]?.image || require("../../../assets/images/placeholder.png")}
                            title={event.name}
                            date={formatDate(event.dateStart)}
                        />
                    ))}
                </ScrollView>
            </Box>
        </Box>
    );
}
