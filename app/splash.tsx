import {
    Box,
    FormControl,
    Input,
    InputField,
    FormControlError,
    FormControlErrorText,
    Button,
    ButtonIcon,
    ButtonText,
    Text,
    Heading,
    useToast,
    VStack,
    Divider,
    HStack,
    FormControlLabel,
    FormControlLabelText,
    Link,
    LinkText,
    Image,
} from "@gluestack-ui/themed";
import { Platform } from "react-native";
import { Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useState, useEffect } from "react";
import { TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { config } from "@/gluestack-ui.config";
import { Star, Wine, Grape, MapPin, PlusIcon } from "lucide-react-native";

WebBrowser.maybeCompleteAuthSession();

// Configuração corrigida do Google SignIn

type LoginFormData = {
    email: string;
    password: string;
};

const loginSchema = yup.object({
    email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
    password: yup.string().min(6, "Mínimo 6 caracteres").required("Senha é obrigatória"),
});

export default function LoginScreen() {
    const router = useRouter();
    const primary = config.tokens.colors.primary["500"];
    const [isLoading, setIsLoading] = useState(false);

    // Configuração corrigida do Google Auth Request
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: "27430021409-n25b5e2urcnv1m0sot5stg8m81muo386.apps.googleusercontent.com",
        iosClientId: "27430021409-s0s3ttbgkjefeai5e3elhe5h9go2a5gj.apps.googleusercontent.com", // Corrigido
        androidClientId: "27430021409-nmhb7q72shobhp7h3vi3okvoaetf2rv8.apps.googleusercontent.com",
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
    });

    const handleEmailLogin = async ({ email, password }: LoginFormData) => {
        setIsLoading(true);
        try {
            console.log("🔥 Tentando login com:", auth, email, password);

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("✅ Login realizado com sucesso:", userCredential.user.email);
            router.replace("/tabs/(tabs)/home");
            // Navegação será feita automaticamente pelo useAuth hook
        } catch (error: any) {
            console.error("❌ Firebase login error:", error);

            let errorMessage = "Erro de autenticação";

            if (error.code === "auth/network-request-failed") {
                errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
            } else if (error.code === "auth/user-not-found") {
                errorMessage = "Usuário não encontrado.";
            } else if (error.code === "auth/wrong-password") {
                errorMessage = "Senha incorreta.";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "E-mail inválido.";
            }

            Alert.alert("Erro de Login", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const result = await promptAsync();
            if (result?.type === "success") {
                const { id_token } = result.params;
                const credential = GoogleAuthProvider.credential(id_token);
                await signInWithCredential(auth, credential);
                showToast("success", "Login com Google realizado!");
            }
        } catch (error) {
            showToast("error", "Erro ao fazer login com Google");
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (type: "success" | "error", message: string) => {
        const toast = useToast();
        toast.show({
            placement: "top",
            render: () => (
                <Box bg={type === "success" ? "$primary600" : "$error500"} px="$4" py="$2" rounded="$sm">
                    <Text color="$textLight50">{message}</Text>
                </Box>
            ),
        });
    };

    return (
        <Box flex={1} style={{ backgroundColor: "#FFF8EC" }} bg="#FFF8EC" justifyContent="center" p="$8">
            <VStack flex={1} space="xl">
                <VStack flex={1} justifyContent="center" alignItems="center" marginBottom={12}>
                    <Image
                        source={require("@/assets/images/logo.jpeg")}
                        alt="Logo do Aplicativo"
                        size="lg"
                        alignSelf="center"
                        className=" w-full max-w-[320px] bg-violet-500 justify-center items-center"
                    />
                    <Heading size="xl" color="$textDark800" textAlign="center">
                        Bem-vindo!
                    </Heading>
                    <Text bold>Viva a experiência.</Text>
                    <Text bold>Descubra o clube dos vinhos!</Text>
                </VStack>

                <Button variant="solid" size="lg" h={70} bgColor={primary} borderRadius="$full" onPress={() => router.push("/createAccount")} isDisabled={!request || isLoading}>
                    <ButtonText color="white" className="p-3" mx="$3">
                        Crie sua conta
                    </ButtonText>
                </Button>
                <Button variant="outline" size="lg" h={70} borderColor={primary} borderRadius="$full" onPress={() => router.push("/login")} isDisabled={!request || isLoading}>
                    <ButtonText color={primary} className="p-3" mx="$3">
                        Entrar
                    </ButtonText>
                </Button>
            </VStack>
        </Box>
    );
}
