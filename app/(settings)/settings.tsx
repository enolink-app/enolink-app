import { Box, Text, VStack, Pressable, HStack, Icon, Divider } from "@gluestack-ui/themed";
import { Globe, LogOut, ShieldCheck, FileText } from "lucide-react-native";
import { Linking, Alert } from "react-native";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { ArrowLeft, Wine, Calendar, User, PlusIcon } from "lucide-react-native";
import { config } from "@/gluestack-ui.config";
export default function SettingsScreen() {
    const router = useRouter();
    const handlesignOut = () => {
        auth.signOut();
        router.replace("/login");
    };
    // Ação para sair
    const handleLogout = async () => {
        Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Sair",
                style: "destructive",
                onPress: async () => {
                    try {
                        await handlesignOut();
                        router.replace("/login"); // ou "/"
                    } catch (error) {
                        Alert.alert("Erro", "Não foi possível sair da conta.");
                    }
                },
            },
        ]);
    };

    // Ação para abrir link externo
    const openURL = (url: string) => {
        Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o link."));
    };

    return (
        <Box flex={1} p={20} mt={50}>
            <HStack justifyContent="flex-start" mb={50}>
                <ArrowLeft onPress={() => router.push("/tabs/(tabs)/profile")} key="half" size={30} style={{ marginRight: 6 }} color={config.tokens.colors.textLight} />
                <Text fontSize="$2xl" fontWeight="$bold" color="$textLight">
                    Configurações
                </Text>
            </HStack>

            <VStack space="md" justifyContent="center">
                {/* Idioma */}
                <Pressable h={36} onPress={() => router.push("/(settings)/language")}>
                    <HStack space="lg" alignItems="center">
                        <Icon as={Globe} size="lg" color="$textLight" />
                        <Text fontSize="$lg" color="$textLight">
                            Idioma
                        </Text>
                    </HStack>
                </Pressable>

                {/* Política de Privacidade */}
                <Pressable h={36} onPress={() => openURL("https://ivino.app/politica")}>
                    <HStack space="lg" alignItems="center">
                        <Icon as={ShieldCheck} size="lg" color="$textLight" />
                        <Text fontSize="$lg" color="$textLight">
                            Política de Privacidade
                        </Text>
                    </HStack>
                </Pressable>

                {/* Termos de Uso */}
                <Pressable h={36} onPress={() => openURL("https://ivino.app/termos")}>
                    <HStack space="lg" alignItems="center">
                        <Icon as={FileText} size="lg" color="$textLight" />
                        <Text fontSize="$lg" color="$textLight">
                            Termos de Uso
                        </Text>
                    </HStack>
                </Pressable>

                <Divider my="$2" />

                {/* Sair */}
                <Pressable h={36} onPress={handleLogout}>
                    <HStack space="lg" alignItems="center">
                        <Icon as={LogOut} size="lg" color="$error500" />
                        <Text fontSize="$lg" color="$error500">
                            Sair da conta
                        </Text>
                    </HStack>
                </Pressable>
            </VStack>
        </Box>
    );
}
