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
import { Linking, ActivityIndicator } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AppleLoginButton from "@/components/AppleButtonLogin";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useState, useEffect } from "react";
import { TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Star, Wine, Grape, MapPin, PlusIcon, Apple } from "lucide-react-native";
import { config } from "@/gluestack-ui.config";
import { createUserInFirestore } from "@/lib/auth/createUserInFirestore";
import { handleAppleLogin } from "@/lib/auth/handleAppleLogin";

WebBrowser.maybeCompleteAuthSession();

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
    const primariLight = config.tokens.colors.primary["300"];
    const primariLightest = config.tokens.colors.primary["100"];
    const [isLoading, setIsLoading] = useState(false);

    // Configuração corrigida do Google Auth
    const [request, response, promptAsync] = Google.useAuthRequest({
        // Web Client ID (obrigatório para todos os casos)
        webClientId: "27430021409-n25b5e2urcnv1m0sot5stg8m81muo386.apps.googleusercontent.com",
        // iOS Client ID
        iosClientId: "27430021409-s0s3ttbgkjefeai5e3elhe5h9go2a5gj.apps.googleusercontent.com",
        // Android Client ID (mesmo que web para Android)
        androidClientId: "27430021409-nmhb7q72shobhp7h3vi3okvoaetf2rv8.apps.googleusercontent.com",
        // Scopes necessários
        scopes: ["openid", "profile", "email"],
        // Configurações adicionais
        selectAccount: true,
    });

    // Monitorar a resposta do Google Auth
    useEffect(() => {
        if (response?.type === "success") {
            handleGoogleSignIn(response);
        } else if (response?.type === "error") {
            console.error("Google Auth Error:", response.error);
        }
    }, [response]);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
    });

    async function signInWithApple() {
        setIsLoading(true);
        try {
            const result = await handleAppleLogin();

            if (result.success) {
                // Se for um novo usuário, redirecione para completar o perfil
                if (result.user?.metadata?.creationTime === result.user?.metadata?.lastSignInTime) {
                    router.push("/complete-profile"); // Página opcional para dados adicionais
                } else {
                    router.replace("/tabs/(tabs)/home");
                }
            } else {
                Alert.alert("Erro", "Não foi possível fazer login com Apple.");
            }
        } catch (error) {
            console.error("Erro:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleSignIn = async (response: any) => {
        setIsLoading(true);
        try {
            const { id_token } = response.params;

            if (!id_token) {
                throw new Error("ID token não encontrado");
            }

            // Primeiro, autentica no Firebase
            const credential = GoogleAuthProvider.credential(id_token);
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;

            console.log("✅ Usuário autenticado:", user.uid);

            // Aguarda um pouco para garantir que o usuário está totalmente autenticado
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Verifica se o usuário atual está definido
            if (!auth.currentUser) {
                throw new Error("Usuário não está autenticado após login");
            }

            // Agora salva no Firestore
            try {
                await createUserInFirestore({
                    uid: user.uid,
                    name: user.displayName || "",
                    email: user.email || "",
                    provider: "google",
                    language: "pt-BR",
                });

                console.log("✅ Usuário salvo no Firestore");
            } catch (firestoreError) {
                // Se falhar ao salvar no Firestore, ainda permite o login
                console.error("⚠️ Erro ao salvar no Firestore, mas login realizado:", firestoreError);
                // Você pode decidir se quer continuar ou não
            }

            router.replace("/tabs/(tabs)/home");
        } catch (error) {
            console.error("❌ Erro no login com Google:", error);

            // Tratamento específico de erros
            let errorMessage = "Erro ao fazer login com Google";

            if (error.code == "auth/network-request-failed") {
                errorMessage = "Erro de conexão. Verifique sua internet.";
            } else if (error.code == "auth/popup-blocked") {
                errorMessage = "Popup bloqueado. Tente novamente.";
            } else if (error.code == "auth/cancelled-popup-request") {
                errorMessage = "Login cancelado.";
            }

            console.log("error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await promptAsync();
        } catch (error) {
            console.error("Erro ao iniciar login com Google:", error);
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
                <Image
                    source={require("@/assets/images/logo.jpeg")}
                    alt="Logo do Aplicativo"
                    size="lg"
                    alignSelf="center"
                    className=" w-full max-w-[320px] bg-violet-500 justify-center items-center"
                />
                <VStack flex={1} justifyContent="center" alignItems="center" marginBottom={12} px={50}>
                    <Heading size="3xl" color="$textDark800" textAlign="center">
                        Escolha como se cadastrar
                    </Heading>
                </VStack>
                <Link onPress={() => router.push("/login")}>
                    <LinkText alignSelf="center">Já tem uma conta? Faça login</LinkText>
                </Link>
                <Button variant="solid" size="lg" h={70} bgColor="white" borderRadius="$full" onPress={handleGoogleLogin} isDisabled={!request || isLoading}>
                    <Image source={require("../assets/images/logo-google.png")} style={{ width: 24, height: 24 }} resizeMode="contain" />
                    <ButtonText color="black" className="p-3" mx="$3">
                        Cadastrar com Google
                    </ButtonText>
                </Button>
                <AppleLoginButton />
                {/*                 <Button variant="solid" size="lg" h={70} bgColor="white" borderRadius="$full" onPress={signInWithApple} isDisabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="black" />
                    ) : (
                        <>
                            <AntDesign name="apple1" size={24} color="black" />
                            <ButtonText color="black" className="p-3" mx="$3">
                                Cadastrar com Apple
                            </ButtonText>
                        </>
                    )}
                </Button> */}
                <Button variant="outline" size="lg" h={70} borderColor={primary} borderRadius="$full" onPress={() => router.push("/register")} isDisabled={isLoading}>
                    <ButtonText color={primary} className="p-3" mx="$3">
                        Cadastrar com e-mail
                    </ButtonText>
                </Button>
            </VStack>
        </Box>
    );
}
