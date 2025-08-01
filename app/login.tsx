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
import { Platform, View } from "react-native";
import { Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useState, useEffect } from "react";
import { TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Plus, ChevronLeft } from "lucide-react-native";
import { config } from "@/gluestack-ui.config";
import { useNavigation } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import { handleAppleLogin } from "@/lib/auth/handleAppleLogin";
import AppleLoginButton from "@/components/AppleButtonLogin";
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
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    const primary = config.tokens.colors.primary["500"];
    const primaryLight = config.tokens.colors.primary["200"];
    const neutralLight = config.tokens.colors.muted;
    const textDark = config.tokens.colors.textDark;
    const textLight = config.tokens.colors.textLight;

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
            console.log("✅ Login realizado com sucesso:", userCredential.user.stsTokenManager.accessToken);
            await AsyncStorage.setItem("token", userCredential.user.stsTokenManager.accessToken);
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
                const signin = await signInWithCredential(auth, credential);
                console.log(`sucesso: ${signin}`);
                showToast("success", "Login com Google realizado!");
            }
        } catch (error) {
            showToast("error", "Erro ao fazer login com Google");
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithApple = async () => {
        try {
            const result = await handleAppleLogin();
            if (result.success) {
                router.replace("/tabs/(tabs)/home");
            } else {
                console.error("Apple login failed:", result.error);
                Alert.alert("Erro", "Falha no login com Apple: " + result.error.message);
            }
        } catch (error) {
            console.error("Apple login error:", error);
            Alert.alert("Erro", "Ocorreu um erro durante o login com Apple");
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
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                <HStack justifyContent="space-between" alignItems="center">
                    <ChevronLeft color={textLight} size={40} onPress={() => router.back()} />
                    <Heading size="lg">Editar Perfil</Heading>
                </HStack>
            </Box>
            <VStack space="xl">
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
                <Box justifyContent="center" alignItems="center" marginBottom={12}>
                    <Text bold>Viva a experiência.</Text>
                    <Text bold>Descubra o clube dos vinhos!</Text>
                </Box>

                <VStack space="md">
                    <FormControl isInvalid={!!errors.email}>
                        <FormControlLabel>
                            <FormControlLabelText>E-mail</FormControlLabelText>
                        </FormControlLabel>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input borderRadius="$lg" className="ring-pink-600" $active-borderColor="pink-600">
                                    <InputField
                                        placeholder="seu@email.com"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={value || ""}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                </Input>
                            )}
                        />
                        <FormControlError>
                            <FormControlErrorText>{errors.email?.message}</FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    <FormControl isInvalid={!!errors.password}>
                        <FormControlLabel>
                            <FormControlLabelText>Senha</FormControlLabelText>
                        </FormControlLabel>
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input borderRadius="$lg">
                                    <InputField placeholder="******" secureTextEntry value={value || ""} onChangeText={onChange} onBlur={onBlur} />
                                </Input>
                            )}
                        />
                        <FormControlError>
                            <FormControlErrorText>{errors.password?.message}</FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    <Button size="lg" bg={config.tokens.colors.primary["500"]} borderRadius="$lg" onPress={handleSubmit(handleEmailLogin)} isDisabled={isLoading}>
                        <ButtonText>{isLoading ? "Entrando..." : "Entrar"}</ButtonText>
                    </Button>
                    <Link onPress={() => router.push("/forgot-password")}>
                        <LinkText>Esqueci minha senha</LinkText>
                    </Link>
                </VStack>

                {/* Divisor */}
                <HStack alignItems="center" space="md">
                    <Divider flex={1} />
                    <Text color="$textDark400">OU</Text>
                    <Divider flex={1} />
                </HStack>

                {/* Botão do Google */}
                <Button h={50} variant="outline" size="lg" borderColor="$primary600" borderRadius="$full" onPress={() => promptAsync()} isDisabled={!request || isLoading}>
                    <Image source={require("../assets/images/logo-google.png")} style={{ width: 18, height: 18 }} resizeMode="contain" />
                    <ButtonText color={"$primary600"} className="p-3" mx="$3">
                        Continuar com Google
                    </ButtonText>
                </Button>
                <AppleLoginButton />
                {/*                 {AppleAuthentication.isAvailableAsync() ? (
                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                        cornerRadius={70}
                        onPress={signInWithApple}
                        disabled={isLoading}
                        style={{ width: "100%", height: 50 }}
                    />
                ) : (
                    <Button onPress={signInWithApple} bg="black" borderRadius="$full" h={50}>
                        <ButtonText>Continue with Apple</ButtonText>
                    </Button>
                )} */}

                {/* Link para Cadastro */}
                <HStack justifyContent="center" space="sm">
                    <Text color="$textDark400">Novo por aqui?</Text>
                    <TouchableOpacity onPress={() => router.push("/register")}>
                        <Text color="$primary600" fontWeight="$bold">
                            Criar conta
                        </Text>
                    </TouchableOpacity>
                </HStack>
            </VStack>
        </Box>
    );
}
