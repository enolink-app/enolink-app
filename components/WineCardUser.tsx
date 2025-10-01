import { Box, Image, Button, Text, ButtonText, Card, Heading, HStack, VStack } from "@gluestack-ui/themed";
import { Star, Wine, Grape, MapPin } from "lucide-react-native";
import { config } from "@/ui/gluestack-ui.config";
import { Platform } from "react-native";

type Props = {
    wine: {
        id: string;
        name: string;
        country: string;
        average: number;
        reviewsCount: number;
        image: { uri: string } | null;
    };
};

const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const stars = [];

    for (let i = 0; i < fullStars; i++) {
        stars.push(<Star key={`full-${i}`} size={16} color="#101010" fill="#101010" />);
    }

    if (hasHalfStar) {
        stars.push(<Star key="half" size={16} color="#101010" fill="rgba(231, 181, 31, 0.5)" />);
    }

    for (let i = 0; i < emptyStars; i++) {
        stars.push(<Star key={`empty-${i}`} size={16} color="#101010" fill="none" />);
    }

    return stars;
};

export default function WineCardUser({ wine }: Props) {
    return (
        <Card
            variant="elevated"
            my="$1"
            flex={1}
            h={100}
            minWidth={"$full"}
            maxWidth={"$full"}
            flexDirection="row"
            aspectRatio={2.5}
            justifyContent="flex-start"
            alignItems="center"
            className="bg-slate-100 w-48 h-20"
            borderRadius="$lg"
        >
            <Image
                source={wine?.image && wine.image.includes("https") ? wine?.image : require("../assets/images/placeholder.png")}
                alt={wine?.name}
                borderRadius={6}
                height={80}
                resizeMode="cover"
            />
            <VStack p="$3" space="md">
                <Box width={180}>
                    <Text fontWeight="$bold" numberOfLines={1} ellipsizeMode="tail">
                        {wine.name}
                    </Text>
                </Box>
                <Box width={180} flexDirection="row" alignItems="center" gap={6}>
                    <MapPin key="half" size={14} color={config.tokens.colors.textLight} />
                    <Text fontSize="$sm" color="$textDark500">
                        {wine.country} • {wine.harvest}
                    </Text>
                </Box>
            </VStack>
        </Card>
    );
}
