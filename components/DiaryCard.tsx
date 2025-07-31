import { Box, Image, VStack, Text, HStack, Pressable } from "@gluestack-ui/themed";
import { StarIcon } from "@gluestack-ui/themed";

interface DiaryCardProps {
    id: string;
    image: string;
    name: string;
    type: string;
    country: string;
    rating: number;
    date: string;
    onPress?: () => void;
}

export function DiaryCard({ id, image, name, type, country, rating, date, onPress }: DiaryCardProps) {
    function formatFirestoreDate(firestoreTimestamp) {
        const date = new Date(firestoreTimestamp._seconds * 1000 + Math.floor(firestoreTimestamp._nanoseconds / 1000000));

        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
    }
    console.log(date, "DATAAA");
    return (
        <Pressable onPress={onPress}>
            <Box bg="$white" p="$4" borderRadius="$lg" shadow="$1" mb="$4" elevation={5} shadowColor="#505050" shadowOffset={{ width: 2, height: 3 }} shadowOpacity={0.2}>
                <HStack space="md" alignItems="center">
                    <Image source={{ uri: image }} alt={name} w={80} h={100} borderRadius="$md" resizeMode="cover" />

                    <VStack flex={1} space="xs">
                        <Text fontWeight="$bold" fontSize="$md">
                            {name}
                        </Text>
                        <Text color="$muted">
                            {type} • {country}
                        </Text>

                        <HStack alignItems="center" space="sm">
                            <Box flexDirection="row">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon key={i} size="sm" fill={i < Math.floor(rating) ? "$yellow500" : "$muted"} color={i < Math.floor(rating) ? "$yellow500" : "$muted"} />
                                ))}
                            </Box>
                            <Text fontSize="$sm">{rating.toFixed(1)}</Text>
                        </HStack>

                        <Text fontSize="$sm" color="$muted">
                            {formatFirestoreDate(date)}
                        </Text>
                    </VStack>
                </HStack>
            </Box>
        </Pressable>
    );
}
