// src/screens/Diary/AddWineFullScreen.tsx
import {
    Box,
    Heading,
    VStack,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Input,
    InputField,
    Button,
    ButtonText,
    Text,
    HStack,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FlatList,
    Pressable,
} from "@gluestack-ui/themed";
import { useForm, Controller } from "react-hook-form";
import { Image, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { config } from "@/gluestack-ui.config";
import { ChevronLeft, Calendar, Search, ChevronDown } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useRequest } from "@/hooks/useRequest";
import { useWineStore } from "@/stores/useWineStores";
import useLanguageStore from "@/stores/useLanguageStore";
import DateTimePicker from "@react-native-community/datetimepicker";

const wineSchema = yup.object({
    name: yup.string().required("Nome é obrigatório"),
    harvest: yup
        .string()
        .matches(/^\d{4}$/, "Informe o ano com 4 dígitos")
        .required("Safra é obrigatória"),
    country: yup.string().required("País é obrigatório"),
    grape: yup.string().required("Variação da uva é obrigatória"),
    abv: yup.string().required("ABV é obrigatório"),
    image: yup.string().notRequired(),
});

type WineFormData = yup.InferType<typeof wineSchema>;

const COUNTRIES = [
    "Argentina",
    "Austrália",
    "Áustria",
    "Brasil",
    "Chile",
    "Espanha",
    "Estados Unidos",
    "França",
    "Itália",
    "Portugal",
    "África do Sul",
    "Alemanha",
    "Nova Zelândia",
    "Uruguai",
].sort();

const GRAPES = [
    "Cabernet Sauvignon",
    "Merlot",
    "Pinot Noir",
    "Syrah",
    "Chardonnay",
    "Sauvignon Blanc",
    "Tempranillo",
    "Malbec",
    "Carménère",
    "Sangiovese",
    "Nebbiolo",
    "Barbera",
    "Zinfandel",
    "Grenache",
    "Viognier",
    "Riesling",
    "Chenin Blanc",
    "Gewürztraminer",
    "Semillon",
    "Moscato",
].sort();

const keyboardVerticalOffset = Platform.OS === "ios" ? 100 : 0;

export default function AddWineFullScreen() {
    const { createWine } = useRequest();
    const { t, forceUpdate } = useLanguageStore();
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [updateKey, setUpdateKey] = useState(0);
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];
    const muted = config.tokens.colors.muted;
    const router = useRouter();
    const addWineToStore = useWineStore((state) => state.addWine);

    const [showYearPicker, setShowYearPicker] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [countrySearch, setCountrySearch] = useState("");
    const [grapeSearch, setGrapeSearch] = useState("");
    const [showCountryModal, setShowCountryModal] = useState(false);
    const [showGrapeModal, setShowGrapeModal] = useState(false);

    const filteredCountries = COUNTRIES.filter((country) => country.toLowerCase().includes(countrySearch.toLowerCase()));

    const filteredGrapes = GRAPES.filter((grape) => grape.toLowerCase().includes(grapeSearch.toLowerCase()));

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<WineFormData>({
        resolver: yupResolver(wineSchema),
        defaultValues: {
            name: "",
            harvest: new Date().getFullYear().toString(),
            country: "",
            grape: "",
            abv: "",
            image: null,
        },
    });

    const currentHarvest = watch("harvest");
    const currentCountry = watch("country");
    const currentGrape = watch("grape");

    const onYearChange = (event: any, selectedDate?: Date) => {
        setShowYearPicker(false);
        if (selectedDate) {
            const year = selectedDate.getFullYear().toString();
            setSelectedYear(selectedDate.getFullYear());
            setValue("harvest", year);
        }
    };

    const selectCountry = (country: string) => {
        setValue("country", country);
        setShowCountryModal(false);
        setCountrySearch("");
    };

    const selectGrape = (grape: string) => {
        setValue("grape", grape);
        setShowGrapeModal(false);
        setGrapeSearch("");
    };

    const handlePickImage = async (fromCamera = false) => {
        const permission = fromCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert("Permissão negada", "Ative as permissões necessárias.");
            return;
        }

        const result = fromCamera
            ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 })
            : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1 });

        if (!result.canceled && result.assets.length > 0) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const onSubmit = async (data: WineFormData) => {
        setLoading(true);
        try {
            const fullData = {
                ...data,
                type: "default",
                image: selectedImage,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const createdWine = await createWine(fullData);
            addWineToStore(createdWine);
            Alert.alert("✅ Vinho salvo!");
            router.back();
        } catch (error) {
            Alert.alert("❌ Algo deu errado!", error instanceof Error ? error.message : "Erro desconhecido");
        } finally {
            setLoading(false);
        }
    };

    const formFields = [
        {
            name: "name",
            label: t("forms.addWineDiary.name"),
            type: "text" as const,
        },
        {
            name: "harvest",
            label: t("forms.addWineDiary.harvest"),
            type: "yearPicker" as const,
        },
        {
            name: "country",
            label: t("forms.addWineDiary.country"),
            type: "countryPicker" as const,
        },
        {
            name: "grape",
            label: t("forms.addWineDiary.grape"),
            type: "grapePicker" as const,
        },
        {
            name: "abv",
            label: t("forms.addWineDiary.abv"),
            type: "numeric" as const,
        },
    ];

    return (
        <Box key={updateKey} flex={1} bg="$backgroundLight" p="$4" mt={Platform.OS == "ios" ? 50 : 0}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                <HStack justifyContent="space-between" alignItems="center">
                    <ChevronLeft key="half" size={30} style={{ marginRight: 6 }} color={config.tokens.colors.textLight} onPress={() => router.back()} />
                    <Heading size="lg">{t("forms.addWineDiary.title")}</Heading>
                </HStack>
            </Box>

            <ScrollView>
                <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={keyboardVerticalOffset}>
                    <VStack space="md">
                        {/* Campos do formulário */}
                        {formFields.map((field) => (
                            <FormControl key={field.name} isInvalid={!!errors[field.name as keyof WineFormData]}>
                                <FormControlLabel>
                                    <FormControlLabelText>{field.label}*</FormControlLabelText>
                                </FormControlLabel>

                                {field.type === "text" || field.type === "numeric" ? (
                                    <Controller
                                        control={control}
                                        name={field.name as keyof WineFormData}
                                        render={({ field: { onChange, value } }) => (
                                            <Input borderColor={muted}>
                                                <InputField
                                                    placeholder={field.label}
                                                    value={value}
                                                    onChangeText={onChange}
                                                    keyboardType={field.type === "numeric" ? "decimal-pad" : "default"}
                                                />
                                            </Input>
                                        )}
                                    />
                                ) : field.type === "yearPicker" ? (
                                    <TouchableOpacity onPress={() => setShowYearPicker(true)}>
                                        <Input borderColor={muted} pointerEvents="none" alignItems="center">
                                            <InputField placeholder="Selecione o ano" value={currentHarvest} editable={false} />
                                            <Calendar size={20} color={muted} style={{ marginRight: 10 }} />
                                        </Input>
                                    </TouchableOpacity>
                                ) : field.type === "countryPicker" ? (
                                    <TouchableOpacity onPress={() => setShowCountryModal(true)}>
                                        <Input borderColor={muted} pointerEvents="none" alignItems="center">
                                            <InputField placeholder="Selecione o país" value={currentCountry} editable={false} />
                                            <ChevronDown size={20} color={muted} style={{ marginRight: 10 }} />
                                        </Input>
                                    </TouchableOpacity>
                                ) : field.type === "grapePicker" ? (
                                    <TouchableOpacity onPress={() => setShowGrapeModal(true)}>
                                        <Input borderColor={muted} pointerEvents="none" alignItems="center">
                                            <InputField placeholder="Selecione a uva" value={currentGrape} editable={false} />
                                            <ChevronDown size={20} color={muted} style={{ marginRight: 10 }} />
                                        </Input>
                                    </TouchableOpacity>
                                ) : null}

                                {errors[field.name as keyof WineFormData] && <Text color="$error500">{errors[field.name as keyof WineFormData]?.message}</Text>}
                            </FormControl>
                        ))}

                        <FormControl>
                            <FormControlLabel>
                                <FormControlLabelText>{t("forms.addWineDiary.image")}</FormControlLabelText>
                            </FormControlLabel>

                            <HStack space="md" mt="$2">
                                <Button variant="solid" bgColor={primary} onPress={() => handlePickImage(true)}>
                                    <ButtonText>{t("forms.addWineDiary.camera")}</ButtonText>
                                </Button>
                                <Button variant="outline" borderColor={primary} onPress={() => handlePickImage(false)}>
                                    <ButtonText color={primary}>{t("forms.addWineDiary.gallery")}</ButtonText>
                                </Button>
                            </HStack>

                            {selectedImage && (
                                <Box mt="$4" alignItems="center">
                                    <Image source={{ uri: selectedImage }} style={{ width: 160, height: 160, borderRadius: 8 }} />
                                </Box>
                            )}
                        </FormControl>

                        <Button mt="$4" bg={primary} onPress={handleSubmit(onSubmit)} disabled={loading}>
                            <ButtonText>{loading ? t("general.loading") : t("forms.addWineDiary.submit")}</ButtonText>
                        </Button>
                    </VStack>
                </KeyboardAvoidingView>
            </ScrollView>

            {showYearPicker && (
                <DateTimePicker
                    value={new Date(selectedYear, 0, 1)}
                    mode="date"
                    display="spinner"
                    onChange={onYearChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                />
            )}

            <Modal isOpen={showCountryModal} onClose={() => setShowCountryModal(false)}>
                <ModalBackdrop />
                <ModalContent>
                    <ModalHeader>
                        <Text fontWeight="bold">Selecionar País</Text>
                    </ModalHeader>
                    <ModalBody>
                        <Input mb="$3" alignItems="center" p={"$2"}>
                            <InputField placeholder={t("general.search")} value={countrySearch} onChangeText={setCountrySearch} />
                            <Search size={20} color={muted} />
                        </Input>
                        <FlatList
                            data={filteredCountries}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <Pressable onPress={() => selectCountry(item)}>
                                    <Box p="$3" borderBottomWidth={1} borderBottomColor="$borderLight200">
                                        <Text>{item}</Text>
                                    </Box>
                                </Pressable>
                            )}
                            style={{ maxHeight: 300 }}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button onPress={() => setShowCountryModal(false)} variant="outline">
                            <ButtonText>Cancelar</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={showGrapeModal} onClose={() => setShowGrapeModal(false)}>
                <ModalBackdrop />
                <ModalContent>
                    <ModalHeader>
                        <Text fontWeight="bold">Selecionar Uva</Text>
                    </ModalHeader>
                    <ModalBody>
                        <Input mb="$3" p={"$2"}>
                            <InputField placeholder={t("general.search")} value={grapeSearch} onChangeText={setGrapeSearch} />
                            <Search size={20} color={muted} />
                        </Input>
                        <FlatList
                            data={filteredGrapes}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <Pressable onPress={() => selectGrape(item)}>
                                    <Box p="$3" borderBottomWidth={1} borderBottomColor="$borderLight200">
                                        <Text>{item}</Text>
                                    </Box>
                                </Pressable>
                            )}
                            style={{ maxHeight: 300 }}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button onPress={() => setShowGrapeModal(false)} variant="outline">
                            <ButtonText>Cancelar</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
