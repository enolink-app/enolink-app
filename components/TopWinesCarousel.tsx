import { Box, Text, Image, HStack, VStack, Button, ScrollView } from "@gluestack-ui/themed";
import StarRating from "react-native-star-rating-widget";
import { useTopWines } from "@/hooks/useTopWines";

export const TopWinesCarousel = () => {
    const { topWines, loading, error } = useTopWines();

    if (loading) return <Text>Carregando...</Text>;
    if (error) return <Text>Erro ao carregar rankings</Text>;
    if (!topWines.length) return <Text>Nenhum vinho avaliado ainda</Text>;

    return (
        <Box mt="$4">
            <Text fontSize="$xl" fontWeight="$bold" mb="$2">
                O que está em alta hoje
            </Text>
            <Text color="$muted" mb="$4">
                Confira os vinhos mais bem avaliados do momento
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space="md">
                    {topWines.map((wine) => (
                        <Box key={wine.wineId} w={200} bg="$white" p="$4" borderRadius="$lg" shadow="$1">
                            <Image source={{ uri: wine.image }} alt={wine.name} w="$full" h={120} resizeMode="contain" borderRadius="$md" mb="$2" />
                            <VStack space="xs">
                                <Text fontWeight="$bold" fontSize="$md">
                                    {wine.name}
                                </Text>
                                <Text color="$muted" fontSize="$sm">
                                    {wine.country}
                                </Text>

                                <HStack alignItems="center" space="sm">
                                    <StarRating rating={wine.averageRating} onChange={() => {}} starSize={16} maxStars={5} enabled={false} />
                                    <Text fontSize="$sm">
                                        {wine.averageRating.toFixed(1)} ({wine.totalEvaluations})
                                    </Text>
                                </HStack>

                                <Button variant="link" size="sm" mt="$2">
                                    <ButtonText>Ver detalhes</ButtonText>
                                </Button>
                            </VStack>
                        </Box>
                    ))}
                </HStack>
            </ScrollView>
        </Box>
    );
};
