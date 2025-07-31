import { Box, Image, Text, HStack, VStack, Card, Button, ButtonText } from "@gluestack-ui/themed";
import { ImageSourcePropType } from "react-native";
import { useRouter } from "expo-router";

type EventCardProps = {
    image: ImageSourcePropType;
    title: string;
    date: string;
    onPress: Function;
};

export function EventUserCard({ image, title, date, onPress }: EventCardProps) {
    const router = useRouter();
    return (
        <Button
            onPress={onPress}
            variant="solid"
            mr="$4"
            mb="$4"
            flex={1}
            h={200}
            w={160}
            elevation={5}
            shadowColor="#505050"
            shadowOffset={{ width: 2, height: 3 }}
            shadowOpacity={0.2}
            m={3}
            flexDirection="column"
            bgColor="#FFFFFF"
            // aspectRatio={1}
            justifyContent="center"
            alignItems="center"
            className="bg-slate-100 w-48 h-20"
            borderRadius="$lg"
        >
            <Image source={image} alt="Foto do evento" width={130} height={130} borderRadius={6} />
            <VStack p="$2" borderRadius="$lg" space="xs" justifyContent="flex-start" alignItems="flex-start">
                <Text fontWeight="$bold" textAlign="left" fontSize="$sm" color="$textLight" numberOfLines={1} ellipsizeMode="tail">
                    {title}
                </Text>
                <Text fontSize="$sm" color="$muted">
                    {date}
                </Text>
            </VStack>
        </Button>
    );
}
