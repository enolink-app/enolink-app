import { Box, Image, Button, Text, ButtonText, Card, Heading, HStack, VStack } from "@gluestack-ui/themed";
import { Star, Wine, Grape, MapPin } from "lucide-react-native";
import { config } from "@/ui/gluestack-ui.config";

type Props = {
    wine: {
        id: string;
        name: string;
        country: string;
        average: number;
        reviewsCount: number;
        image: any;
    };
};

const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const stars = [];

    for (let i = 0; i < fullStars; i++) {
        stars.push(<Star key={`full-${i}`} size={16} color="#E71F65" fill="#E71F65" />);
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

export default function WineCardUser({ wine }: Props) {
    return (
        <Card
            variant="elevated"
            mr="$4"
            my="$1"
            flex={1}
            h={150}
            flexDirection="row"
            aspectRatio={2.5}
            justifyContent="flex-start"
            alignItems="center"
            className="bg-slate-100 w-48 h-20"
            borderRadius="$lg"
        >
            <Image source={wine.image} alt={wine.name} borderRadius={6} height={120} resizeMode="cover" />
            <VStack p="$3" space="md">
                <Box width={180}>
                    <Text fontWeight="$bold" numberOfLines={1} ellipsizeMode="tail">
                        {wine.name}
                    </Text>
                </Box>
                <Box width={180} flexDirection="row" alignItems="center" gap={6}>
                    <Wine key="half" size={14} color={config.tokens.colors.textLight} />
                    <Text fontSize="$sm" color="$textDark500">
                        {wine.type}
                    </Text>
                </Box>
                <Box width={180} flexDirection="row" alignItems="center" gap={6}>
                    <Grape key="half" size={14} color={config.tokens.colors.textLight} />
                    <Text fontSize="$sm" color="$textDark500">
                        {wine.grape}
                    </Text>
                </Box>
                <Box width={180} flexDirection="row" alignItems="center" gap={6}>
                    <MapPin key="half" size={14} color={config.tokens.colors.textLight} />
                    <Text fontSize="$sm" color="$textDark500">
                        {wine.country}
                    </Text>
                </Box>
            </VStack>
        </Card>
    );
}
