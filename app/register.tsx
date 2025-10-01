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
import { Platform, ScrollView } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "expo-router";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerUser } from "@/lib/auth/registerUser";
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { config } from "@/gluestack-ui.config";
import { MaskedTextInput } from "react-native-mask-text";
import { ChevronDownIcon, ChevronLeft } from "lucide-react-native";
import { useNavigation } from "expo-router";
import useLanguageStore from "@/stores/useLanguageStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { ptBR, enUS, es, it, fr } from "date-fns/locale";

export default function RegisterScreen() {
    type RegisterFormData = yup.InferType<typeof registerSchema>;
    const navigation = useNavigation();
    const { t, forceUpdate } = useLanguageStore();
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];
    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    const registerSchema = yup.object({
        name: yup.string().required(t("register.name") + " " + t("general.required")),
        email: yup
            .string()
            .email(t("register.email") + " " + t("general.invalid"))
            .required(t("register.email") + " " + t("general.required")),
        birthDate: yup.string().required(t("register.dateBirth") + " " + t("general.required")),
        language: yup.string().required(t("register.lang") + " " + t("general.required")),
        password: yup
            .string()
            .min(8, t("register.mustContain1"))
            .matches(/[a-z]/, t("register.mustContain2"))
            .matches(/[A-Z]/, t("register.mustContain3"))
            .matches(/\d/, t("register.mustContain4"))
            .matches(/[!@#$%^&*(),.?":{}|<>]/, t("register.mustContain5"))
            .required(t("register.password") + " " + t("general.required")),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref("password")], t("register.notMatch"))
            .required(t("register.confirmPassword")),
    });

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: yupResolver(registerSchema),
    });

    const languageOptions = [
        { label: "🇧🇷 Português (Brasil)", value: "pt-BR" },
        { label: "🇵🇹 Português (Portugal)", value: "pt-PT" },
        { label: "🇺🇸 English", value: "en" },
        { label: "🇪🇸 Español", value: "es-ES" },
        { label: "🇮🇹 Italiano", value: "it-IT" },
        { label: "🇫🇷 Français", value: "fr-FR" },
    ];

    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const router = useRouter();
    const toast = useToast();

    const passwordValue = watch("password", "");
    const selectedLanguage = watch("language", "pt-BR");

    const formatDate = (date: Date, language: string) => {
        const locales: { [key: string]: Locale } = {
            "pt-BR": ptBR,
            "pt-PT": ptBR,
            en: enUS,
            "es-ES": es,
            "it-IT": it,
            "fr-FR": fr,
        };

        return format(date, "dd/MM/yyyy", { locale: locales[language] || enUS });
    };

    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(Platform.OS === "ios");

        if (date) {
            setSelectedDate(date);
            setValue("birthDate", formatDate(date, selectedLanguage));
        }
    };

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
            const user = await registerUser({
                email: data.email,
                password: data.password,
                name: data.name,
                birthDate: data.birthDate,
                language: data.language,
            });

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
        <ScrollView key={updateKey} style={{ backgroundColor: neutralLight, paddingTop: Platform.OS == "ios" ? 50 : 0 }}>
            <VStack flex={1} space="xl" p="$4">
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                    <HStack justifyContent="space-between" alignItems="center">
                        <ChevronLeft onPress={() => router.back()} key="half" size={30} style={{ marginRight: 6 }} color={config.tokens.colors.textLight} />

                        <Heading size="lg">{t("register.create")}</Heading>
                    </HStack>
                </Box>

                <FormControl isInvalid={!!errors.name}>
                    <FormControlLabel>
                        <FormControlLabelText>{t("register.name")}</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <Input>
                                <InputField bg="#FFFFFF" placeholder={t("register.name")} value={value} onChangeText={onChange} />
                            </Input>
                        )}
                    />
                    {errors.name && <Text color="$error500">{errors.name.message}</Text>}
                </FormControl>

                {/* Email */}
                <FormControl isInvalid={!!errors.email}>
                    <FormControlLabel>
                        <FormControlLabelText>{t("register.email")}</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value } }) => (
                            <Input>
                                <InputField
                                    bg="#FFFFFF"
                                    placeholder={t("register.email")}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            </Input>
                        )}
                    />
                    {errors.email && <Text color="$error500">{errors.email.message}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.birthDate}>
                    <FormControlLabel>
                        <FormControlLabelText>{t("register.dateBirth")}</FormControlLabelText>
                    </FormControlLabel>

                    <Controller
                        control={control}
                        name="birthDate"
                        render={({ field: { value } }) => (
                            <>
                                <Pressable onPress={() => setShowDatePicker(true)}>
                                    <Input pointerEvents="none">
                                        <InputField bg="#FFFFFF" placeholder="DD/MM/AAAA" value={value} editable={false} />
                                    </Input>
                                </Pressable>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="date"
                                        display={Platform.OS === "ios" ? "spinner" : "default"}
                                        onChange={handleDateChange}
                                        maximumDate={new Date()}
                                        locale={selectedLanguage}
                                    />
                                )}
                            </>
                        )}
                    />

                    {errors.birthDate && <Text color="$error500">{errors.birthDate.message}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.language}>
                    <FormControlLabel>
                        <FormControlLabelText>{t("register.lang")}</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="language"
                        render={({ field: { onChange, value } }) => (
                            <Select selectedValue={value} onValueChange={onChange}>
                                <SelectTrigger bg="#FFFFFF" variant="outline" size="md">
                                    <SelectInput bg="#FFFFFF" placeholder="Selecione o idioma" />
                                    <SelectIcon as={ChevronDownIcon} mx={6} />
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

                <FormControl isInvalid={!!errors.password}>
                    <FormControlLabel>
                        <FormControlLabelText>{t("register.password")}</FormControlLabelText>
                    </FormControlLabel>

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value } }) => (
                            <VStack space="xs">
                                <Input>
                                    <InputField bg="#FFFFFF" placeholder={t("register.password")} secureTextEntry value={value} onChangeText={onChange} />
                                </Input>

                                <Text fontSize="$xs" color="$textLight500" mt="$1">
                                    {t("register.mustContain0")}
                                </Text>
                                <VStack space="xs" ml="$2">
                                    <Text fontSize="$xs" color={value?.length >= 8 ? "$success500" : "$textLight400"}>
                                        {t("register.mustContain1")}
                                    </Text>
                                    <Text fontSize="$xs" color={/[a-z]/.test(value || "") ? "$success500" : "$textLight400"}>
                                        {t("register.mustContain2")}
                                    </Text>
                                    <Text fontSize="$xs" color={/[A-Z]/.test(value || "") ? "$success500" : "$textLight400"}>
                                        {t("register.mustContain3")}
                                    </Text>
                                    <Text fontSize="$xs" color={/\d/.test(value || "") ? "$success500" : "$textLight400"}>
                                        {t("register.mustContain4")}
                                    </Text>
                                    <Text fontSize="$xs" color={/[!@#$%^&*(),.?":{}|<>]/.test(value || "") ? "$success500" : "$textLight400"}>
                                        {t("register.mustContain5")}
                                    </Text>
                                </VStack>
                            </VStack>
                        )}
                    />

                    {errors.password && <Text color="$error500">{errors.password.message}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormControlLabel>
                        <FormControlLabelText>{t("register.confirmPassword")}</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, value } }) => (
                            <Input>
                                <InputField bg="#FFFFFF" placeholder={t("register.confirmPassword")} secureTextEntry value={value} onChangeText={onChange} />
                            </Input>
                        )}
                    />
                    {errors.confirmPassword && <Text color="$error500">{errors.confirmPassword.message}</Text>}
                </FormControl>

                <Button variant="solid" mt="$4" bg={primary} onPress={handleSubmit(onSubmit)} isDisabled={loading}>
                    <ButtonText>{loading ? t("general.loading") : t("register.create")}</ButtonText>
                </Button>
            </VStack>
        </ScrollView>
    );
}
