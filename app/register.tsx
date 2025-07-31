// app/(auth)/register.tsx
import {
    Box,
    Heading,
    VStack,
    Pressable,
    HStack,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Input,
    InputField,
    Button,
    ButtonText,
    Text,
    useToast,
    Select,
    SelectTrigger,
    SelectBackdrop,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectContent,
    SelectDragIndicatorWrapper,
    SelectDragIndicator,
    SelectItem,
} from "@gluestack-ui/themed";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "expo-router";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerUser } from "@/lib/auth/registerUser";
import { useState } from "react";
import { Alert } from "react-native";
import { config } from "@/gluestack-ui.config";
import { MaskedTextInput } from "react-native-mask-text";
import { ChevronDownIcon, ChevronLeft } from "lucide-react-native";
import { useNavigation } from "expo-router";
import useLanguageStore from "@/stores/useLanguageStore";
// 💡 Schema de validação
const registerSchema = yup.object({
    name: yup.string().required("Nome é obrigatório"),
    email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
    birthDate: yup.string().required("Data de nascimento é obrigatória"),
    language: yup.string().required("Idioma é obrigatório"),
    password: yup.string().min(6, "Mínimo 6 caracteres").required("Senha é obrigatória"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "As senhas não coincidem")
        .required("Confirme sua senha"),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

export default function RegisterScreen() {
    const navigation = useNavigation();
    const primary = config.tokens.colors.primary["500"];
    const primaryLight = config.tokens.colors.primary["200"];
    const neutralLight = config.tokens.colors.muted;
    const textDark = config.tokens.colors.textDark;
    const textLight = config.tokens.colors.textLight;

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: yupResolver(registerSchema),
    });
    const languageOptions = [
        { label: "🇧🇷 Português", value: "pt-BR" },
        { label: "🇺🇸 English", value: "en-US" },
        { label: "🇪🇸 Español", value: "es-ES" },
    ];

    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const toast = useToast();

    const showToast = (type: "success" | "error", message: string) => {
        toast.show({
            placement: "top",
            render: () => (
                <Box bg={type === "success" ? "$success600" : "$error500"} px="$4" py="$2" rounded="$sm">
                    <Text color="$textLight50">{message}</Text>
                </Box>
            ),
        });
    };

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        try {
            // Registrar usuário
            const user = await registerUser({
                email: data.email,
                password: data.password,
                name: data.name,
                birthDate: data.birthDate,
                language: data.language,
            });

            // Atualizar o idioma no estado global
            useLanguageStore.getState().setLanguage(data.language as LanguageCode);

            showToast("success", "Conta criada com sucesso!");
            router.replace("/login");
        } catch (error: any) {
            console.error(error);
            showToast("error", error.message || "Erro ao criar conta. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box flex={1} bg="$backgroundLight" p="$4" mt={50}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                <HStack justifyContent="space-between" alignItems="center">
                    <ChevronLeft color={textLight} size={40} onPress={() => router.back()} />
                    <Heading size="lg">Editar Perfil</Heading>
                </HStack>
            </Box>
            <Heading size="lg" mb="$4">
                Criar Conta
            </Heading>

            <VStack space="md">
                {/* Nome */}
                <FormControl isInvalid={!!errors.name}>
                    <FormControlLabel>
                        <FormControlLabelText>Nome</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <Input>
                                <InputField placeholder="Digite seu nome" value={value} onChangeText={onChange} />
                            </Input>
                        )}
                    />
                    {errors.name && <Text color="$error500">{errors.name.message}</Text>}
                </FormControl>

                {/* Email */}
                <FormControl isInvalid={!!errors.email}>
                    <FormControlLabel>
                        <FormControlLabelText>Email</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value } }) => (
                            <Input>
                                <InputField placeholder="email@email.com" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} />
                            </Input>
                        )}
                    />
                    {errors.email && <Text color="$error500">{errors.email.message}</Text>}
                </FormControl>

                {/* Data de nascimento */}
                <FormControl isInvalid={!!errors.birthDate}>
                    <FormControlLabel>
                        <FormControlLabelText>Data de Nascimento</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="birthDate"
                        render={({ field: { onChange, value } }) => (
                            <Input>
                                <MaskedTextInput
                                    mask="99/99/9999"
                                    placeholder="DD/MM/AAAA"
                                    keyboardType="numeric"
                                    onChangeText={onChange}
                                    value={value}
                                    style={{
                                        padding: 10,
                                        fontSize: 16,
                                        color: "#000",
                                        flex: 1,
                                    }}
                                />
                            </Input>
                        )}
                    />

                    {errors.birthDate && <Text color="$error500">{errors.birthDate.message}</Text>}
                </FormControl>

                {/* Idioma */}
                <FormControl isInvalid={!!errors.language}>
                    <FormControlLabel>
                        <FormControlLabelText>Idioma</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="language"
                        render={({ field: { onChange, value } }) => (
                            <Select selectedValue={value} onValueChange={onChange}>
                                <SelectTrigger variant="outline" size="md">
                                    <SelectInput placeholder="Selecione o idioma" />
                                    <SelectIcon as={ChevronDownIcon} />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        <SelectDragIndicatorWrapper>
                                            <SelectDragIndicator />
                                        </SelectDragIndicatorWrapper>
                                        {languageOptions.map((lang) => (
                                            <SelectItem key={lang.value} label={lang.label} value={lang.value} />
                                        ))}
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        )}
                    />
                    {errors.language && <Text color="$error500">{errors.language.message}</Text>}
                </FormControl>

                {/* Senha */}
                <FormControl isInvalid={!!errors.password}>
                    <FormControlLabel>
                        <FormControlLabelText>Senha</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value } }) => (
                            <Input>
                                <InputField placeholder="Digite sua senha" secureTextEntry value={value} onChangeText={onChange} />
                            </Input>
                        )}
                    />
                    {errors.password && <Text color="$error500">{errors.password.message}</Text>}
                </FormControl>

                {/* Confirmar senha */}
                <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormControlLabel>
                        <FormControlLabelText>Confirmar Senha</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, value } }) => (
                            <Input>
                                <InputField placeholder="Confirme sua senha" secureTextEntry value={value} onChangeText={onChange} />
                            </Input>
                        )}
                    />
                    {errors.confirmPassword && <Text color="$error500">{errors.confirmPassword.message}</Text>}
                </FormControl>

                <Button variant="solid" mt="$4" bg={primary} onPress={handleSubmit(onSubmit)} isDisabled={loading}>
                    <ButtonText>{loading ? "Criando..." : "Criar Conta"}</ButtonText>
                </Button>
            </VStack>
        </Box>
    );
}
