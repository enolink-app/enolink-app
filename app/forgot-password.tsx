import { Box, VStack, Heading, Input, InputField, Button, ButtonText, Text, FormControl, FormControlLabel, FormControlLabelText, HStack } from "@gluestack-ui/themed";
import { useForm, Controller } from "react-hook-form";
import { Alert, Platform } from "react-native";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import useLanguageStore from "@/stores/useLanguageStore";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { config } from "@/gluestack-ui.config";
import { useState, useEffect } from "react";
const schema = yup.object({
    email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
});

type ForgotPasswordForm = yup.InferType<typeof schema>;

export default function ForgotPasswordScreen() {
    const { t, forceUpdate } = useLanguageStore();
    const router = useRouter();
    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordForm>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async ({ email }: ForgotPasswordForm) => {
        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert("Verifique seu e-mail", "Enviamos um link para redefinir sua senha.");
        } catch (error: any) {
            let msg = "Erro ao tentar enviar o e-mail de redefinição.";
            if (error.code === "auth/user-not-found") {
                msg = "Usuário não encontrado com este e-mail.";
            }
            Alert.alert("Erro", msg);
        }
    };

    return (
        <Box key={updateKey} flex={1} bg="$backgroundLight" p="$4" mt={Platform.OS == "ios" ? 50 : 0}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                <HStack justifyContent="space-between" alignItems="center">
                    <ChevronLeft onPress={() => router.back()} key="half" size={30} style={{ marginRight: 6 }} color={config.tokens.colors.textLight} />

                    <Heading size="lg">{t("forms.newWine.title")}</Heading>
                </HStack>
            </Box>
            <Box flex={1} justifyContent="center">
                <VStack space="lg">
                    <Heading size="lg" textAlign="center">
                        {t("forgot.recover")}
                    </Heading>

                    <Text textAlign="center">{t("forgot.text")}</Text>

                    <FormControl isInvalid={!!errors.email}>
                        <FormControlLabel>
                            <FormControlLabelText>{t("forgot.email")}</FormControlLabelText>
                        </FormControlLabel>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <Input>
                                    <InputField placeholder="email@exemplo.com" keyboardType="email-address" value={value} onChangeText={onChange} autoCapitalize="none" />
                                </Input>
                            )}
                        />
                        {errors.email && <Text color="$error500">{errors.email.message}</Text>}
                    </FormControl>

                    <Button onPress={handleSubmit(onSubmit)} bg="$primary500">
                        <ButtonText>{t("forgot.submit")}</ButtonText>
                    </Button>
                </VStack>
            </Box>
        </Box>
    );
}
