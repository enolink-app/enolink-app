import { Box, Image, Button, Text, ButtonText, Card, Heading, HStack, VStack } from "@gluestack-ui/themed";
import { Star } from "lucide-react-native";
type Props = {
    wine: {
        id: string;
        name: string;
        country: string;
        average: number;
        reviewsCount: number;
        image: any; // por conta do require()
        onPress: Function;
    };
};

const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const stars = [];

    for (let i = 0; i < fullStars; i++) {
        stars.push(<Star key={`full-${i}`} size={16} color="#5D1728" fill="#5D1728" />);
    }

    if (hasHalfStar) {
        // Você pode usar outro ícone se quiser algo mais gráfico
        stars.push(
            <Star
                key="half"
                size={16}
                color="#E71F65"
                fill="rgba(231, 31, 101, 0.5)" // truque visual para meia estrela
            />
        );
    }

    for (let i = 0; i < emptyStars; i++) {
        stars.push(<Star key={`empty-${i}`} size={16} color="#E71F65" fill="none" />);
    }

    return stars;
};

export default function WineCard({ wine, onPress }: Props) {
    return (
        <Card
            onPress={() => (onPress ? onPress : console.log(""))}
            variant="elevated"
            mr="$4"
            flex={1}
            h={150}
            flexDirection="row"
            aspectRatio={2}
            justifyContent="center"
            alignItems="center"
            className="bg-slate-100 w-48 h-20"
            borderRadius="$lg"
        >
            <Image source={wine.image} alt={wine.name} borderRadius={6} height={120} resizeMode="cover" />
            <VStack p="$3" space="xs">
                <Box width={180}>
                    <Text fontWeight="$bold" numberOfLines={1} ellipsizeMode="tail">
                        {wine.name}
                    </Text>
                </Box>
                <Text fontSize="$sm" color="$textDark500">
                    {wine.country}
                </Text>
                <HStack alignItems="center" mt="$1">
                    {renderStars(wine.average)}
                    <Text ml="$2" fontSize="$sm">
                        {wine.average.toFixed(1)} ({wine.reviewsCount})
                    </Text>
                </HStack>
            </VStack>
        </Card>
    );
}
