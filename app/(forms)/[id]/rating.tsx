import { useState } from "react";
import { Box, Heading, VStack, FormControl, FormControlLabel, FormControlLabelText, Textarea, TextareaInput, Button, ButtonText, HStack, Text } from "@gluestack-ui/themed";
import StarRating from "react-native-star-rating-widget";
import { ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { config } from "@/gluestack-ui.config";
import { auth } from "@/lib/firebase";
import { useRequest } from "@/hooks/useRequest";
import { useEventStore } from "@/stores/useEventStore";

const keyboardVerticalOffset = Platform.OS === "ios" ? 100 : 0;
const primary = config.tokens.colors.primary["500"];
const neutralDark = config.tokens.colors.primary["600"];
const neutralLight = config.tokens.colors.primary["700"];
const accent = config.tokens.colors.primary["800"];
const gold = config.tokens.colors.primary["900"];
const textLight = config.tokens.colors.textLight;
const errorColor = config.tokens.colors.error["500"];

export default function RateWineScreen() {
    const { evaluateWineEvent } = useRequest();
    const { refreshEventData } = useEventStore();
    const [colorRating, setColorRating] = useState(0);
    const [aromaRating, setAromaRating] = useState(0);
    const [flavorRating, setFlavorRating] = useState(0);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({
        color: "",
        aroma: "",
        flavor: "",
    });
    const params = useLocalSearchParams();
    const { eventId, index: wineIndex, wineId, wineName } = params;
    const router = useRouter();

    const validateRatings = () => {
        const errors = {
            color: "",
            aroma: "",
            flavor: "",
        };
        let isValid = true;

        if (colorRating < 0.5 || colorRating > 5) {
            errors.color = "Avalie a cor entre 0.5 e 5 estrelas";
            isValid = false;
        }

        if (aromaRating < 0.5 || aromaRating > 5) {
            errors.aroma = "Avalie o aroma entre 0.5 e 5 estrelas";
            isValid = false;
        }

        if (flavorRating < 0.5 || flavorRating > 5) {
            errors.flavor = "Avalie o sabor entre 0.5 e 5 estrelas";
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    const clearValidationErrors = () => {
        setValidationErrors({
            color: "",
            aroma: "",
            flavor: "",
        });
    };

    const formatRating = (rating) => {
        return Math.round(rating * 2) / 2;
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        clearValidationErrors();

        if (!validateRatings()) {
            Alert.alert("Avaliação Incompleta", "Por favor, avalie todos os critérios com notas entre 0.5 e 5 estrelas.", [{ text: "Entendi" }]);
            return;
        }

        setIsSubmitting(true);

        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) {
            Alert.alert("Autenticação Necessária", "Você precisa estar logado para avaliar. Faça login e tente novamente.", [{ text: "OK", onPress: () => router.push("/login") }]);
            setIsSubmitting(false);
            return;
        }

        if (!eventId || !wineId || wineIndex === undefined) {
            Alert.alert("Dados Incompletos", "Informações do evento ou vinho não foram carregadas corretamente. Tente novamente.", [{ text: "OK" }]);
            setIsSubmitting(false);
            return;
        }

        const evaluationData = {
            eventId: String(eventId),
            wineId: String(wineId),
            wineIndex: Number(wineIndex),
            userId: currentUserId,
            aroma: formatRating(aromaRating),
            color: formatRating(colorRating),
            flavor: formatRating(flavorRating),
            notes: notes.trim(),
            createdAt: new Date().toISOString(),
        };

        try {
            const result = await evaluateWineEvent(evaluationData);

            if (result === "success") {
                await refreshEventData(String(eventId));

                Alert.alert("✅ Avaliação Registrada!", "Sua avaliação foi salva com sucesso.", [
                    {
                        text: "Ok",
                        onPress: () => router.back(),
                        style: "cancel",
                    },
                ]);
            } else {
                const errorMessage = result.includes("já avaliou")
                    ? "Você já avaliou este vinho. Só é permitido uma avaliação por vinho."
                    : result || "Ocorreu um erro ao enviar sua avaliação.";

                Alert.alert("Ops!", errorMessage);
            }
        } catch (error) {
            console.error("Erro na avaliação:", error);
            const isNetworkError = error?.message?.includes("Network");

            Alert.alert(
                isNetworkError ? "Problema de Conexão" : "Erro Inesperado",
                isNetworkError
                    ? "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente."
                    : "Ocorreu um erro inesperado ao processar sua avaliação. Tente novamente mais tarde."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box flex={1} bg="$backgroundLight" p="$4" mt={Platform.OS == "ios" ? 50 : 0}>
            <HStack alignItems="center" mb="$4">
                <ChevronLeft key="half" size={30} style={{ marginRight: 6 }} color={config.tokens.colors.textLight} onPress={() => router.back()} />
                <Heading size="lg" mb="$4">
                    Avaliar Vinho
                </Heading>
            </HStack>

            {wineName && (
                <Box bg="$backgroundLight100" p="$3" borderRadius="$md" mb="$4">
                    <Text fontWeight="$bold" color="$textDark800">
                        {decodeURIComponent(wineName)}
                    </Text>
                </Box>
            )}

            <ScrollView>
                <VStack space="xl" justifyContent="space-between" h={"$5/6"} py={36}>
                    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={keyboardVerticalOffset}>
                        <FormControl isInvalid={!!validationErrors.color}>
                            <FormControlLabel>
                                <FormControlLabelText>Cor</FormControlLabelText>
                            </FormControlLabel>
                            <StarRating
                                rating={colorRating}
                                onChange={(rating) => {
                                    setColorRating(rating);
                                    if (validationErrors.color) {
                                        setValidationErrors({ ...validationErrors, color: "" });
                                    }
                                }}
                                starSize={32}
                                animationConfig={{ scale: 1.05 }}
                                enableHalfStar={true}
                            />
                            {validationErrors.color && (
                                <Text color={errorColor} fontSize="$sm" mt="$1">
                                    {validationErrors.color}
                                </Text>
                            )}
                        </FormControl>

                        <FormControl isInvalid={!!validationErrors.aroma}>
                            <FormControlLabel>
                                <FormControlLabelText>Aroma</FormControlLabelText>
                            </FormControlLabel>
                            <StarRating
                                rating={aromaRating}
                                onChange={(rating) => {
                                    setAromaRating(rating);
                                    if (validationErrors.aroma) {
                                        setValidationErrors({ ...validationErrors, aroma: "" });
                                    }
                                }}
                                starSize={32}
                                animationConfig={{ scale: 1.05 }}
                                enableHalfStar={true}
                            />
                            {validationErrors.aroma && (
                                <Text color={errorColor} fontSize="$sm" mt="$1">
                                    {validationErrors.aroma}
                                </Text>
                            )}
                        </FormControl>

                        <FormControl isInvalid={!!validationErrors.flavor}>
                            <FormControlLabel>
                                <FormControlLabelText>Sabor</FormControlLabelText>
                            </FormControlLabel>
                            <StarRating
                                rating={flavorRating}
                                onChange={(rating) => {
                                    setFlavorRating(rating);
                                    if (validationErrors.flavor) {
                                        setValidationErrors({ ...validationErrors, flavor: "" });
                                    }
                                }}
                                starSize={32}
                                animationConfig={{ scale: 1.05 }}
                                enableHalfStar={true}
                            />
                            {validationErrors.flavor && (
                                <Text color={errorColor} fontSize="$sm" mt="$1">
                                    {validationErrors.flavor}
                                </Text>
                            )}
                        </FormControl>

                        <FormControl>
                            <FormControlLabel>
                                <FormControlLabelText>Notas rápidas (opcional)</FormControlLabelText>
                            </FormControlLabel>
                            <Textarea size="md">
                                <TextareaInput
                                    placeholder="O que achou do vinho? Suas impressões, características, etc."
                                    multiline
                                    numberOfLines={3}
                                    value={notes}
                                    onChangeText={setNotes}
                                />
                            </Textarea>
                        </FormControl>
                    </KeyboardAvoidingView>

                    <Button variant="solid" bgColor={primary} mt="$4" onPress={handleSubmit} isDisabled={isSubmitting}>
                        <ButtonText color="white">{isSubmitting ? "Enviando..." : "Enviar Avaliação"}</ButtonText>
                    </Button>

                    <Box bg="$backgroundLight100" p="$3" borderRadius="$md" mt="$2">
                        <Text fontSize="$sm" color="$textDark500" textAlign="center">
                            💡 Toque nas estrelas para dar avaliações de 0.5 em 0.5
                        </Text>
                    </Box>
                </VStack>
            </ScrollView>
        </Box>
    );
}
