// EventCard.tsx - Componente atualizado
import { Box, Image, Text, HStack, VStack, Button, ButtonText, Badge, BadgeText } from "@gluestack-ui/themed";
import { ImageSourcePropType } from "react-native";

type EventCardProps = {
    image: ImageSourcePropType | { uri: string };
    title: string;
    date: string;
    distance?: string;
    isNearby?: boolean;
    text: string;
    onPress: () => void;
};

export function EventCard({ image, title, date, distance, isNearby, onPress, text }: EventCardProps) {
    return (
        <Button
            onPress={onPress}
            variant="solid"
            flex={1}
            h={100}
            minWidth={"$full"}
            maxWidth={"$full"}
            elevation={5}
            shadowColor="#505050"
            shadowOffset={{ width: 2, height: 3 }}
            shadowOpacity={0.2}
            my={3}
            shadowRadius={2}
            flexDirection="row"
            aspectRatio={2.5}
            justifyContent="flex-start"
            alignItems="center"
            bgColor="#FFFFFF"
            className="bg-slate-100 w-48 h-20"
            borderRadius="$lg"
        >
            {isNearby && (
                <Badge position="absolute" top="$2" left="$2" zIndex={1} bg="$green500">
                    <BadgeText>Próximo de você</BadgeText>
                </Badge>
            )}
            <HStack p="$2" borderRadius="$lg" space="md">
                <Image source={image} alt="Foto do evento" width={80} height={80} borderRadius={6} resizeMode="cover" defaultSource={require("../assets/images/placeholder.png")} />
                <VStack justifyContent="flex-start" alignItems="flex-start" flex={1}>
                    <Box width={160} my={3}>
                        <Text fontWeight="$bold" fontSize="$md" color="$textLight" numberOfLines={2} ellipsizeMode="tail">
                            {title}
                        </Text>
                    </Box>
                    <Text fontSize="$sm" color="$muted">
                        {date}
                    </Text>
                    {distance && (
                        <Text fontSize="$xs" color="$primary500" mt="$1">
                            {distance}
                        </Text>
                    )}
                </VStack>
                <Box justifyContent="center" alignItems="center">
                    <Text fontWeight="$bold">{text}</Text>
                </Box>
            </HStack>
        </Button>
    );
}
