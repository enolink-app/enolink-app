import { Box, Text } from "@gluestack-ui/themed";
import "dayjs/locale/pt-br";

export default function EventsSettingsScreen() {
    return (
        <Box flex={1} bg="$backgroundLight" p="$4" mt={50}>
            <Text fontSize="$2xl" fontWeight="$bold" color="$textLight" mb="$4">
                Configurações do Evento
            </Text>
        </Box>
    );
}
