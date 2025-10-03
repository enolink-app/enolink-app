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
import { Linking, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AppleLoginButton from "@/components/AppleButtonLogin";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { config } from "@/gluestack-ui.config";
import { createUserInFirestore } from "@/lib/auth/createUserInFirestore";
import useLanguageStore from "@/stores/useLanguageStore";
import * as AuthSession from "expo-auth-session";
import { exchangeCodeAsync, TokenResponse } from "expo-auth-session";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { useAuth } from "@/hooks/useAuth";

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
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { user, loading } = useAuth();

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
        if (user) {
            console.log("Usuário já autenticado, redirecionando...");
            router.replace("/tabs/(tabs)/home");
        }
    }, [user]);

    useEffect(() => {
        console.log("RESPONSE", request);
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

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            if (!request) {
                console.error("Google request não inicializado.");
                setIsLoading(false);
                return;
            }

            const result = await promptAsync({ useProxy: true });
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
                }).catch((error) => {
                    console.log("OPS! Algo deu errado: ", error);
                });
                console.log("✅ Usuário salvo no Firestore");
                router.replace("/tabs/(tabs)/home");
            } catch (firestoreError) {
                console.error("⚠️ Erro ao salvar no Firestore, mas login realizado:", firestoreError);
            }
            showToast("success", "Sucesso!");
        } catch (err) {
            showToast("error", "Algo deu errado!");
            console.error("Erro no handleGoogleLogin:", err);
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
        <Box key={updateKey} flex={1} bg={neutralLight} justifyContent="center" p="$8">
            <VStack flex={1} space="xl">
                <VStack flex={1} justifyContent="center" alignItems="center" marginBottom={12} px={50}>
                    <Image
                        source={require("@/assets/images/icon.png")}
                        alt="Logo do Aplicativo"
                        size="lg"
                        alignSelf="center"
                        className=" w-96 h-96 bg-violet-500 justify-center items-center"
                    />
                    <Heading size="2xl" color={primary} textAlign="center">
                        {t("register.create")}
                    </Heading>
                </VStack>
                <Link onPress={() => router.push("/login")}>
                    <LinkText color={primary} alignSelf="center">
                        {t("register.haveAccount")}
                    </LinkText>
                </Link>
                <Button variant="outline" size="lg" h={70} borderColor={neutralDark} borderRadius="$full" onPress={handleGoogleLogin} isDisabled={!request || isLoading}>
                    <Image source={require("../assets/images/logo-google.png")} style={{ width: 24, height: 24 }} resizeMode="contain" />
                    <ButtonText color="black" className="p-3" mx="$3">
                        {t("login.signIn")} Google
                    </ButtonText>
                </Button>
                {Platform.OS == "ios" && <AppleLoginButton />}

                <Button variant="outline" size="lg" h={70} borderColor={primary} borderRadius="$full" onPress={() => router.push("/register")} isDisabled={isLoading}>
                    <ButtonText color={primary} className="p-3" mx="$3">
                        {t("login.signIn")} e-mail
                    </ButtonText>
                </Button>
            </VStack>
        </Box>
    );
}
