import { Box, VStack, Heading, FormControl, FormControlLabel, Button, HStack, Text, ButtonText, Textarea, TextareaInput } from "@gluestack-ui/themed";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import StarRating from "react-native-star-rating-widget";
import { useRequest } from "@/hooks/useRequest";
import { auth } from "@/lib/firebase";
import { Alert } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { config } from "@/gluestack-ui.config";
import useLanguageStore from "@/stores/useLanguageStore";
import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";

const keyboardVerticalOffset = Platform.OS === "ios" ? 100 : 0;

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
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];
    const textDark = config.tokens.colors.textDark;
    const textLight = config.tokens.colors.textLight;
    const goldTransparent = "#B89F5B30";
    const primaryTransparent = "#6B223230";
    const bgLight = config.tokens.colors.backgroundLight;

    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    useEffect(() => {
        const fetchWine = async () => {
            try {
                const data = await getWineById(wineId);
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
        <Box key={updateKey} flex={1} bg="$backgroundLight" p="$4" mt={Platform.OS == "ios" ? 50 : 0}>
            <HStack alignItems="center" mb="$4">
                <ChevronLeft key="half" size={30} style={{ marginRight: 6 }} color={config.tokens.colors.textLight} onPress={() => router.back()} />
                <Heading size="lg" ml="$2">
                    {t("forms.diaryRating.title")}
                </Heading>
            </HStack>

            {wine && (
                <Box bg={primaryTransparent} p="$3" borderRadius="$md" mb="$4">
                    <Text color={primary} fontWeight="$bold">
                        {wine.name}
                    </Text>
                    <Text color={primary}>
                        {wine.grape} • {wine.country}
                    </Text>
                </Box>
            )}
            <ScrollView style={{ flex: 1 }}>
                <VStack space="xl" mb="$8">
                    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={keyboardVerticalOffset}>
                        <FormControl>
                            <FormControlLabel>
                                <Text fontWeight="$bold">{t("forms.diaryRating.color")}</Text>
                            </FormControlLabel>
                            <StarRating color={gold} rating={colorRating} onChange={setColorRating} starSize={32} />
                        </FormControl>

                        <FormControl>
                            <FormControlLabel>
                                <Text fontWeight="$bold">{t("forms.diaryRating.aroma")}</Text>
                            </FormControlLabel>
                            <StarRating color={gold} rating={aromaRating} onChange={setAromaRating} starSize={32} />
                        </FormControl>

                        <FormControl>
                            <FormControlLabel>
                                <Text fontWeight="$bold">{t("forms.diaryRating.flavor")}</Text>
                            </FormControlLabel>
                            <StarRating color={gold} rating={flavorRating} onChange={setFlavorRating} starSize={32} />
                        </FormControl>

                        <FormControl>
                            <FormControlLabel>
                                <Text fontWeight="$bold">{t("forms.diaryRating.notes")}</Text>
                            </FormControlLabel>
                            <Textarea size="md">
                                <TextareaInput borderRadius={3} bg="#FFFFFF" placeholder={t("forms.diaryRating.notes")} value={notes} onChangeText={setNotes} multiline />
                            </Textarea>
                        </FormControl>
                        <Button size="lg" my="$3" onPress={handleSubmit} bgColor={primary} isDisabled={loading || colorRating === 0 || aromaRating === 0 || flavorRating === 0}>
                            <ButtonText>{loading ? t("general.loading") : t("forms.diaryRating.submit")}</ButtonText>
                        </Button>
                    </KeyboardAvoidingView>
                </VStack>
            </ScrollView>
        </Box>
    );
}
