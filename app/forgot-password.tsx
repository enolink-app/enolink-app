import { Box, VStack, Heading, Input, InputField, Button, ButtonText, Text, FormControl, FormControlLabel, FormControlLabelText } from "@gluestack-ui/themed";
import { useForm, Controller } from "react-hook-form";
import { Alert } from "react-native";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

const schema = yup.object({
    email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
});

type ForgotPasswordForm = yup.InferType<typeof schema>;

export default function ForgotPasswordScreen() {
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
        <Box flex={1} bg="$backgroundLight" p="$4" justifyContent="center">
            <VStack space="lg">
                <Heading size="lg" textAlign="center">
                    Recuperar senha
                </Heading>

                <Text textAlign="center">Digite o e-mail cadastrado para receber o link de redefinição.</Text>

                <FormControl isInvalid={!!errors.email}>
                    <FormControlLabel>
                        <FormControlLabelText>E-mail</FormControlLabelText>
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
                    <ButtonText>Enviar link</ButtonText>
                </Button>
            </VStack>
        </Box>
    );
}
