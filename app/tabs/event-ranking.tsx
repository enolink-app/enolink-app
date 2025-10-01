import { Box, Text } from "@gluestack-ui/themed";
import "dayjs/locale/pt-br";
import { Platform } from "react-native";
export default function EventsRankingScreen() {
    return (
        <Box flex={1} bg="$backgroundLight" p="$4" mt={Platform.OS == "ios" ? 50 : 0}>
            <Text fontSize="$2xl" fontWeight="$bold" color="$textLight" mb="$4">
                Ranking do Evento
            </Text>
        </Box>
    );
}
