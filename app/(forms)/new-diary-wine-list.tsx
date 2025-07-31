import { Box, VStack, Heading, Pressable, HStack, Image, Text, ScrollView, Button, ButtonText } from "@gluestack-ui/themed";
import { Plus } from "lucide-react-native";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { useRequest } from "@/hooks/useRequest";
import { auth } from "@/lib/firebase";
import { config } from "@/gluestack-ui.config";
import { useFocusEffect } from "expo-router";
import { useWineStore } from "@/stores/useWineStores";
import { ChevronLeft } from "lucide-react-native";
export default function SelectWineScreen() {
    const router = useRouter();
    const { getWineByUser } = useRequest();
    const [wines, setWines] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser;
    const primary = config.tokens.colors.primary["500"];
    const userWines = useWineStore((state) => state.userWines);
    const textLight = config.tokens.colors.textLight;
    const fetchUserWines = useWineStore((state) => state.fetchUserWines);
    useFocusEffect(
        useCallback(() => {
            const organizerId = user.uid; // Obtenha o ID do organizador
            fetchUserWines(organizerId);
            setLoading(false);
        }, [fetchUserWines]) // 'fetchUserWines' é uma função estável do Zustand, não causará loop
    );
    return (
        <Box flex={1} bg="$backgroundLight" p="$4" mt={50}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                <HStack justifyContent="space-between" alignItems="center">
                    <ChevronLeft color={textLight} size={40} onPress={() => router.back()} />
                    <Heading size="lg" mb="$4">
                        Escolha o Vinho
                    </Heading>
                </HStack>
            </Box>

            {loading ? (
                <Text>Carregando...</Text>
            ) : (
                <View style={{ justifyContent: "center" }}>
                    <ScrollView style={{ marginBottom: 100 }}>
                        <VStack space="md">
                            {userWines.map((wine) => (
                                <Pressable
                                    elevation={5}
                                    shadowColor="#505050"
                                    shadowOffset={{ width: 2, height: 3 }}
                                    shadowOpacity={0.2}
                                    key={wine.id}
                                    bg="white"
                                    borderRadius="$lg"
                                    p="$3"
                                    onPress={() =>
                                        router.push({
                                            pathname: "/(forms)/diary-rating",
                                            params: { wineId: wine.id },
                                        })
                                    }
                                >
                                    <HStack space="md">
                                        <Image source={{ uri: wine.image }} alt={wine.name} w={70} h={90} borderRadius={8} />
                                        <VStack space="xs">
                                            <Text fontWeight="$bold" fontSize="$md">
                                                {wine.name}
                                            </Text>
                                            <Text>{`🍷 ${wine.type}`}</Text>
                                            <Text>{`🍇 ${wine.grape || "Variedade não informada"}`}</Text>
                                            <Text>{`📍 ${wine.country}`}</Text>
                                        </VStack>
                                    </HStack>
                                </Pressable>
                            ))}
                        </VStack>
                    </ScrollView>

                    <Button
                        position="absolute"
                        bottom={64}
                        w={"$full"}
                        mt="$6"
                        p="$2"
                        flexDirection="row"
                        borderRadius="$lg"
                        bg={primary}
                        alignItems="center"
                        onPress={() => router.push("/(forms)/add-wine-diary")}
                    >
                        <ButtonText fontSize="$md" fontWeight="$medium">
                            Novo Vinho
                        </ButtonText>
                        <Plus size={20} color={"white"} />
                    </Button>
                </View>
            )}
        </Box>
    );
}
