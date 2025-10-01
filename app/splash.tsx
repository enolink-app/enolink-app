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

export default function LoginScreen() {
    const router = useRouter();
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];

    const [isLoading, setIsLoading] = useState(false);
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: "27430021409-n25b5e2urcnv1m0sot5stg8m81muo386.apps.googleusercontent.com",
        iosClientId: "27430021409-uqcg92jgpji2nj2ik5vo3ogmu3qvlp6j.apps.googleusercontent.com", // Corrigido
        androidClientId: "27430021409-nmhb7q72shobhp7h3vi3okvoaetf2rv8.apps.googleusercontent.com",
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
    });

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
                <VStack flex={1} justifyContent="center" alignItems="center" marginBottom={12}>
                    <Image
                        source={require("@/assets/images/icon.png")}
                        alt="Logo do Aplicativo"
                        size="lg"
                        height={120}
                        width={120}
                        alignSelf="center"
                        className=" w-96 h-96 bg-violet-500 justify-center items-center"
                    />
                    <Heading size="xl" color={primary} textAlign="center">
                        {t("login.wellcome")}
                    </Heading>
                    <Text bold color="$textDark800">
                        {t("login.phrase")}
                    </Text>
                    <Text bold color="$textDark800">
                        {t("login.phrase2")}
                    </Text>
                </VStack>

                <Button variant="solid" size="lg" h={70} bgColor={primary} borderRadius="$full" onPress={() => router.push("/createAccount")} isDisabled={!request || isLoading}>
                    <ButtonText color="white" className="p-3" mx="$3">
                        {t("login.create")}
                    </ButtonText>
                </Button>
                <Button variant="outline" size="lg" h={70} borderColor={primary} borderRadius="$full" onPress={() => router.push("/login")} isDisabled={!request || isLoading}>
                    <ButtonText color={primary} className="p-3" mx="$3">
                        {t("login.join")}
                    </ButtonText>
                </Button>
            </VStack>
        </Box>
    );
}
