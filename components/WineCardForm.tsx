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

export default function WineCardForm({ wine, onPress }: Props) {
    const primary = config.tokens.colors.primary?.["500"];
    return (
        <Card
            variant="elevated"
            mr="$4"
            my="$1"
            flex={1}
            p={3}
            h={150}
            w={"$full"}
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
            className="bg-slate-100 w-48 h-20"
            borderRadius="$lg"
        >
            <Image source={wine.image} alt={wine.name} borderRadius={6} m={8} height={120} resizeMode="cover" />
            <VStack p="$2" space="md">
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
            <Button size="sm" backgroundColor={primary} onPress={() => onPress()}>
                <ButtonText>Adicionar</ButtonText>
            </Button>
        </Card>
    );
}
