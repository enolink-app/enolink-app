// EventCard.tsx - Componente atualizado
import { Box, Image, Text, HStack, VStack, Button, ButtonText, Badge, BadgeText } from "@gluestack-ui/themed";
import { ImageSourcePropType } from "react-native";

type EventCardProps = {
    image: ImageSourcePropType | { uri: string };
    title: string;
    date: string;
    distance?: string;
    isNearby?: boolean;
    onPress: () => void;
};

export function EventCard({ image, title, date, distance, isNearby, onPress }: EventCardProps) {
    return (
        <Button
            onPress={onPress}
            variant="solid"
            mr="$4"
            flex={1}
            h={150}
            elevation={5}
            shadowColor="#505050"
            shadowOffset={{ width: 2, height: 3 }}
            shadowOpacity={0.2}
            m={3}
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
                <Image
                    source={image}
                    alt="Foto do evento"
                    width={120}
                    height={120}
                    borderRadius={6}
                    // Adicionar propriedades para melhor carregamento
                    resizeMode="cover"
                    // Fallback para erro no carregamento
                    defaultSource={require("../assets/images/placeholder.png")}
                />
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
            </HStack>
        </Button>
    );
}
