import { useState } from "react";
import { Box, Heading, VStack, FormControl, FormControlLabel, FormControlLabelText, Textarea, TextareaInput, Button, ButtonText, HStack } from "@gluestack-ui/themed";
import StarRating from "react-native-star-rating-widget";
import { ChevronLeft } from "lucide-react-native";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { config } from "@/gluestack-ui.config";
import { auth } from "@/lib/firebase";
import { useRequest } from "@/hooks/useRequest";
import { useEventStore } from "@/stores/useEventStore";

const primary = config.tokens.colors.primary["500"];
const textLight = config.tokens.colors.textLight;

export default function RateWineScreen() {
    const { evaluateWineEvent } = useRequest();
    const { refreshEventData } = useEventStore();
    const [colorRating, setColorRating] = useState(0);
    const [aromaRating, setAromaRating] = useState(0);
    const [flavorRating, setFlavorRating] = useState(0);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const params = useLocalSearchParams();
    const { eventId, index: wineIndex, wineId } = params;
    const router = useRouter();

    const handleSubmit = async () => {
        // Impede múltiplos envios simultâneos
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Validação das avaliações
        if (colorRating < 1 || colorRating > 5 || aromaRating < 1 || aromaRating > 5 || flavorRating < 1 || flavorRating > 5) {
            Alert.alert("Avaliação Incompleta", "Por favor, avalie todos os critérios com notas entre 1 e 5 estrelas.", [{ text: "Entendi" }]);
            setIsSubmitting(false);
            return;
        }

        // Validação de dados do usuário e evento
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

        // Prepara os dados da avaliação
        const evaluationData = {
            eventId: String(eventId),
            wineId: String(wineId),
            wineIndex: Number(wineIndex),
            userId: currentUserId,
            aroma: Math.round(aromaRating * 2) / 2, // Permite meias estrelas
            color: Math.round(colorRating * 2) / 2,
            flavor: Math.round(flavorRating * 2) / 2,
            notes: notes.trim(),
            createdAt: new Date().toISOString(),
        };

        try {
            // Envia a avaliação
            const result = await evaluateWineEvent(evaluationData);

            // Trata o resultado
            if (result === "success") {
                // Atualiza os dados locais
                await refreshEventData(String(eventId));

                // Feedback visual com opção de voltar ou continuar avaliando
                Alert.alert("✅ Avaliação Registrada!", "Sua avaliação foi salva com sucesso.", [
                    {
                        text: "Avaliar Outro Vinho",
                        onPress: () => {
                            // Reseta o formulário para nova avaliação
                            setColorRating(0);
                            setAromaRating(0);
                            setFlavorRating(0);
                            setNotes("");
                        },
                    },
                    {
                        text: "Voltar",
                        onPress: () => router.back(),
                        style: "cancel",
                    },
                ]);
            } else {
                // Trata erros específicos da API
                const errorMessage = result.includes("já avaliou")
                    ? "Você já avaliou este vinho. Só é permitido uma avaliação por vinho."
                    : result || "Ocorreu um erro ao enviar sua avaliação.";

                Alert.alert("Ops!", errorMessage);
            }
        } catch (error) {
            console.error("Erro na avaliação:", error);

            // Tratamento diferenciado para erros de rede
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
        <Box flex={1} bg="$backgroundLight" p="$4" mt={50}>
            <HStack alignItems="center" mb="$4">
                <ChevronLeft color={textLight} size={32} onPress={() => router.back()} />
                <Heading size="lg" mb="$4">
                    Avaliar Vinho
                </Heading>
            </HStack>

            <VStack space="xl" justifyContent="space-between" h={"$5/6"} py={36}>
                <FormControl>
                    <FormControlLabel>
                        <FormControlLabelText>Cor</FormControlLabelText>
                    </FormControlLabel>
                    <StarRating rating={colorRating} onChange={setColorRating} starSize={32} enableHalfStar={false} />
                </FormControl>

                <FormControl>
                    <FormControlLabel>
                        <FormControlLabelText>Aroma</FormControlLabelText>
                    </FormControlLabel>
                    <StarRating rating={aromaRating} onChange={setAromaRating} starSize={32} enableHalfStar={false} />
                </FormControl>

                <FormControl>
                    <FormControlLabel>
                        <FormControlLabelText>Sabor</FormControlLabelText>
                    </FormControlLabel>
                    <StarRating rating={flavorRating} onChange={setFlavorRating} starSize={32} enableHalfStar={false} />
                </FormControl>

                <FormControl>
                    <FormControlLabel>
                        <FormControlLabelText>Notas rápidas (opcional)</FormControlLabelText>
                    </FormControlLabel>
                    <Textarea size="md">
                        <TextareaInput placeholder="O que achou do vinho?" multiline numberOfLines={3} value={notes} onChangeText={setNotes} />
                    </Textarea>
                </FormControl>

                <Button variant="solid" bgColor={primary} mt="$4" onPress={handleSubmit} isDisabled={isSubmitting}>
                    <ButtonText color="white">{isSubmitting ? "Enviando..." : "Enviar Avaliação"}</ButtonText>
                </Button>
            </VStack>
        </Box>
    );
}
