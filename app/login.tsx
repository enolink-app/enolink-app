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
import { createUserInFirestore } from "@/lib/auth/createUserInFirestore";
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
import useLanguageStore from "@/stores/useLanguageStore";

WebBrowser.maybeCompleteAuthSession();

type LoginFormData = {
    email: string;
    password: string;
};

const loginSchema = yup.object({
    email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
    password: yup.string().min(6, "Mínimo 6 caracteres").required("Senha é obrigatória"),
});

const discovery = {
    tokenEndpoint: "https://oauth2.googleapis.com/token",
};

export default function LoginScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { t, forceUpdate } = useLanguageStore();
    const navigation = useNavigation();
    const [updateKey, setUpdateKey] = useState(0);
    const toast = useToast();
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: "27430021409-n25b5e2urcnv1m0sot5stg8m81muo386.apps.googleusercontent.com",
        iosClientId: "27430021409-uqcg92jgpji2nj2ik5vo3ogmu3qvlp6j.apps.googleusercontent.com",
        androidClientId: "27430021409-nmhb7q72shobhp7h3vi3okvoaetf2rv8.apps.googleusercontent.com",
        scopes: ["openid", "profile", "email"],
        selectAccount: true,
    });

    async function exchangeCodeWithFetch({
        tokenEndpoint,
        clientId,
        code,
        redirectUri,
        codeVerifier,
    }: {
        tokenEndpoint: string;
        clientId: string;
        code: string;
        redirectUri: string;
        codeVerifier: string;
    }) {
        const body = new URLSearchParams({
            client_id: clientId,
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
        }).toString();

        const res = await fetch(tokenEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
        });

        const json = await res.json();
        if (!res.ok) {
            throw new Error(`Token endpoint error: ${res.status} ${JSON.stringify(json)}`);
        }
        return json;
    }

    useEffect(() => {
        console.log("RESPONSE", request?.codeVerifier);
        if (response?.type === "success" && response.params?.code) {
            (async () => {
                try {
                    const tokenResponse = await AuthSession.exchangeCodeAsync(
                        {
                            clientId: "27430021409-n25b5e2urcnv1m0sot5stg8m81muo386.apps.googleusercontent.com",
                            code: response.params.code,
                            redirectUri: AuthSession.makeRedirectUri({ scheme: "com.vivavinho.enolink" }),
                            clientSecret: "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",
                            codeVerifier: response?.params?.codeVerifier,
                            grantType: "authorization_code",
                        },
                        discovery
                    ).catch((error) => {
                        console.log("OPS! Algo deu errado: ", error);
                    });

                    console.log("Tokens do Google:", tokenResponse);
                    const id_token = (tokenResponse as any).id_token || tokenResponse.idToken;

                    if (!id_token) {
                        throw new Error("id_token não retornado pelo servidor (verifique client/redirect).");
                    }

                    const credential = GoogleAuthProvider.credential(id_token);
                    const userCredential = await signInWithCredential(auth, credential);
                    console.log("Usuário Firebase:", userCredential.user.uid);
                } catch (err) {
                    console.error("Erro trocando code por token:", err);
                }
            })();
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

    const handleEmailLogin = async ({ email, password }: LoginFormData) => {
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            await AsyncStorage.setItem("token", userCredential.user.stsTokenManager.accessToken);
            router.replace("/tabs/(tabs)/home");
        } catch (error: any) {
            console.error("❌ Firebase login error:", error);

            let errorMessage = "Credenciais incorretas";

            if (error.code === "auth/network-request-failed") {
                errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
            } else if (error.code === "auth/user-not-found") {
                errorMessage = "Usuário não encontrado.";
            } else if (error.code === "auth/wrong-password") {
                errorMessage = "Senha incorreta.";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "E-mail inválido.";
            }

            showToast("error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            if (!request) {
                console.error("Google request não inicializado.");
                setIsLoading(false);
                return;
            }

            const result = await promptAsync({ useProxy: true }); // ajuste useProxy conforme ambiente
            console.log("Resultado do promptAsync:", result);

            if (result.type !== "success") {
                setIsLoading(false);
                return;
            }

            const code = result.params?.code;
            if (!code) {
                console.error("Authorization code não veio no resultado:", result);
                setIsLoading(false);
                return;
            }

            const clientIdToUse = (request as any).clientId || (request as any).extraParams?.client_id;
            const redirectUriToUse = (request as any).redirectUri || AuthSession.makeRedirectUri({ scheme: "com.vivavinho.enolink" });
            const codeVerifierToUse = (request as any).codeVerifier;

            console.log("USANDO PARA EXCHANGE:", { clientIdToUse, redirectUriToUse, codeVerifierToUse });

            const tokenResponse = await exchangeCodeWithFetch({
                tokenEndpoint: discovery.tokenEndpoint,
                clientId: clientIdToUse,
                code,
                redirectUri: redirectUriToUse,
                codeVerifier: codeVerifierToUse,
            });

            console.log("Token response:", tokenResponse);
            const idToken = (tokenResponse as any).id_token || (tokenResponse as any).idToken;
            if (!idToken) throw new Error("id_token não retornado");

            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;

            console.log("✅ Usuário autenticado:", user.uid);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (!auth.currentUser) {
                throw new Error("Usuário não está autenticado após login");
            }

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
                console.error("⚠️ Erro ao salvar no Firestore, mas login realizado:", firestoreError);
            }
            showToast("success", "Sucesso!");
            router.replace("/tabs/(tabs)/home");
        } catch (err) {
            showToast("error", "Algo deu errado!");
            console.error("Erro no handleGoogleLogin:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (type: "success" | "error", message: string) => {
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
        <Box key={updateKey} flex={1} bg={neutralLight} justifyContent="center" p="$8">
            <VStack space="xl">
                <Image
                    source={require("@/assets/images/icon.png")}
                    alt="Logo do Aplicativo"
                    size="lg"
                    alignSelf="center"
                    className=" w-full max-w-[420px] justify-center items-center"
                />
                <Heading size="xl" color={primary} textAlign="center">
                    {t("login.wellcome")}
                </Heading>
                <Box justifyContent="center" alignItems="center" marginBottom={12}>
                    <Text color={neutralDark} bold>
                        {t("login.phrase")}
                    </Text>
                    <Text color={neutralDark} bold>
                        {t("login.phrase2")}
                    </Text>
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
                                        backgroundColor="#FFFFFF"
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
                            <FormControlLabelText>{t("register.password")}</FormControlLabelText>
                        </FormControlLabel>
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input borderRadius="$lg">
                                    <InputField backgroundColor="#FFFFFF" placeholder="******" secureTextEntry value={value || ""} onChangeText={onChange} onBlur={onBlur} />
                                </Input>
                            )}
                        />
                        <FormControlError>
                            <FormControlErrorText>{errors.password?.message}</FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    <Button size="lg" bg={accent} borderRadius="$lg" onPress={handleSubmit(handleEmailLogin)} isDisabled={isLoading}>
                        <ButtonText color={neutralLight}>{isLoading ? t("general.loading") : t("login.join")}</ButtonText>
                    </Button>
                    <Link onPress={() => router.push("/forgot-password")}>
                        <LinkText color={primary}>{t("login.forgot")}</LinkText>
                    </Link>
                </VStack>

                <HStack alignItems="center" space="md">
                    <Divider flex={1} />
                    <Text color={neutralDark}>{t("login.or")}</Text>
                    <Divider flex={1} />
                </HStack>

                <Button h={70} variant="outline" size="lg" borderColor={neutralDark} borderRadius="$full" onPress={() => handleGoogleLogin()} isDisabled={!request || isLoading}>
                    <Image source={require("../assets/images/logo-google.png")} style={{ width: 18, height: 18 }} resizeMode="contain" />
                    <ButtonText color={neutralDark} className="p-3" mx="$3">
                        {t("login.signIn")} Google
                    </ButtonText>
                </Button>
                {Platform.OS == "ios" && <AppleLoginButton />}
                <HStack justifyContent="center" space="sm">
                    <Text color={neutralDark}>{t("login.new")}</Text>
                    <TouchableOpacity onPress={() => router.push("/createAccount")}>
                        <Text color={primary} fontWeight="$bold">
                            {t("login.create")}
                        </Text>
                    </TouchableOpacity>
                </HStack>
            </VStack>
        </Box>
    );
}
