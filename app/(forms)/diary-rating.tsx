import { Box, VStack, Heading, FormControl, FormControlLabel, Button, HStack, Text, ButtonText, Textarea, TextareaInput } from "@gluestack-ui/themed";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import StarRating from "react-native-star-rating-widget";
import { useRequest } from "@/hooks/useRequest";
import { auth } from "@/lib/firebase";
import { Alert } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { config } from "@/gluestack-ui.config";
export default function DiaryRatingScreen() {
    const router = useRouter();
    const { wineId } = useLocalSearchParams();
    const { createDiaryEntry, getWineById } = useRequest();
    const [colorRating, setColorRating] = useState(0);
    const [aromaRating, setAromaRating] = useState(0);
    const [flavorRating, setFlavorRating] = useState(0);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [wine, setWine] = useState(null);
    console.log(wineId, `GET WINE ID`);
    useEffect(() => {
        const fetchWine = async () => {
            try {
                console.log(`BUSCANDO VINHO ID ${wineId}...`);
                const data = await getWineById(wineId);
                console.log("VINHO ENCONTRADO: ", data);
                setWine(data);
            } catch (error) {
                console.error("Error fetching wine:", error);
            }
        };

        fetchWine();
    }, [wineId]);

    const handleSubmit = async () => {
        if (!wineId || !auth.currentUser?.uid) {
            Alert.alert("Erro", "Dados incompletos");
            return;
        }

        setLoading(true);
        try {
            await createDiaryEntry({
                wineId,
                wineData: {
                    name: wine?.name || "Vinho desconhecido",
                    type: wine?.type || "",
                    country: wine?.country || "",
                    image: wine?.image || "",
                    grape: wine?.grape || "",
                },
                color: colorRating,
                aroma: aromaRating,
                flavor: flavorRating,
                notes,
            });

            Alert.alert("Sucesso", "Avaliação registrada no seu diário!");
            router.push("/tabs/diary");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível salvar a avaliação");
            console.error("Error creating diary entry:", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box flex={1} bg="$backgroundLight" p="$4">
            <HStack alignItems="center" mb="$4">
                <ChevronLeft size={32} onPress={() => router.back()} />
                <Heading size="lg" ml="$2">
                    Nova Avaliação
                </Heading>
            </HStack>

            {wine && (
                <Box bg="$primary50" p="$3" borderRadius="$md" mb="$4">
                    <Text fontWeight="$bold">{wine.name}</Text>
                    <Text>
                        {wine.type} • {wine.country}
                    </Text>
                </Box>
            )}

            <VStack space="xl" mb="$8">
                <FormControl>
                    <FormControlLabel>
                        <Text fontWeight="$bold">Cor</Text>
                    </FormControlLabel>
                    <StarRating rating={colorRating} onChange={setColorRating} starSize={32} color={config.tokens.colors.primary["500"]} />
                </FormControl>

                <FormControl>
                    <FormControlLabel>
                        <Text fontWeight="$bold">Aroma</Text>
                    </FormControlLabel>
                    <StarRating rating={aromaRating} onChange={setAromaRating} starSize={32} color={config.tokens.colors.primary["500"]} />
                </FormControl>

                <FormControl>
                    <FormControlLabel>
                        <Text fontWeight="$bold">Sabor</Text>
                    </FormControlLabel>
                    <StarRating rating={flavorRating} onChange={setFlavorRating} starSize={32} color={config.tokens.colors.primary["500"]} />
                </FormControl>

                <FormControl>
                    <FormControlLabel>
                        <Text fontWeight="$bold">Notas (opcional)</Text>
                    </FormControlLabel>
                    <Textarea size="md">
                        <TextareaInput placeholder="Ex: Aroma frutado e cítrico..." value={notes} onChangeText={setNotes} multiline />
                    </Textarea>
                </FormControl>
            </VStack>

            <Button size="lg" onPress={handleSubmit} isDisabled={loading || colorRating === 0 || aromaRating === 0 || flavorRating === 0}>
                <ButtonText>{loading ? "Salvando..." : "Salvar Avaliação"}</ButtonText>
            </Button>
        </Box>
    );
}
