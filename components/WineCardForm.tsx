import { Box, Image, Button, Text, ButtonText, Card, VStack } from "@gluestack-ui/themed";
import { Grape, MapPin, Trash2 } from "lucide-react-native";
import { config } from "@/ui/gluestack-ui.config";
import useLanguageStore from "@/stores/useLanguageStore";
import { useState, useEffect } from "react";
import { number } from "yup";
type Props = {
    wine: {
        id: string;
        name: string;
        country: string;
        grape: string;
        image: any;
    };
    onPress: () => void;
    isAdded?: boolean; // Nova prop para identificar se o vinho já foi adicionado
};

const primary = config.tokens.colors.primary["500"];
const neutralDark = config.tokens.colors.primary["600"];
const neutralLight = config.tokens.colors.primary["700"];
const accent = config.tokens.colors.primary["800"];
const gold = config.tokens.colors.primary["900"];

export default function WineCardForm({ wine, onPress, isAdded = false }: Props) {
    const primary = config.tokens.colors.primary?.["500"];
    const error = config.tokens.colors.error?.["500"];
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    const truncateText = (text: string, maxLength: number) => {
        if (text && text.length > maxLength) {
            return text.substring(0, maxLength) + "...";
        }
        return text;
    };
    return (
        <Card
            key={updateKey}
            variant="elevated"
            mr="$4"
            my="$1"
            flex={1}
            p={3}
            h={100}
            w={"$full"}
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
            borderRadius="$lg"
            backgroundColor={"white"}
            opacity={isAdded ? 0.7 : 1}
        >
            <Image
                source={wine.image && wine.image.include("https") ? wine.image : require("../assets/images/placeholder.png")}
                alt={wine.name}
                borderRadius={6}
                m={8}
                height={80}
                width={80}
                resizeMode="cover"
            />
            <VStack p="$2" space="md" flex={1}>
                <Box width={180}>
                    <Text fontWeight="$bold" numberOfLines={1} ellipsizeMode="tail">
                        {truncateText(wine.name, 15)}
                        {isAdded && " (" + t("general.added") + ")"}
                    </Text>
                </Box>
                <Box width={180} flexDirection="row" alignItems="center" gap={6}>
                    <MapPin size={14} color={config.tokens.colors.textLight} />
                    <Text fontSize="$sm" color="$textDark500">
                        {wine.country}
                    </Text>
                </Box>
            </VStack>
            <Button size="sm" mx="$3" variant={isAdded ? "outline" : "solid"} borderColor="$error500" backgroundColor={isAdded ? "white" : gold} onPress={onPress}>
                {isAdded ? (
                    <>
                        <Trash2 size={16} color="red" />
                    </>
                ) : (
                    <ButtonText>{t("general.add")}</ButtonText>
                )}
            </Button>
        </Card>
    );
}
