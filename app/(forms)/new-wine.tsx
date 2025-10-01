import { useState, useEffect } from "react";
import {
    Box,
    Heading,
    VStack,
    HStack,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Input,
    InputField,
    Button,
    ButtonText,
    Text,
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
import { ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from "react-native";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert } from "react-native";
import { config } from "@/gluestack-ui.config";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ChevronLeft, Calendar, Search, ChevronDown } from "lucide-react-native";
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
    abv: yup.string().required("Vedação é obrigatória"),
    image: yup.string().nullable().optional(),
});

type WineFormData = yup.InferType<typeof wineSchema>;

// Lista de países (exemplo)
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

export default function AddWineScreen() {
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];
    const textDark = config.tokens.colors.textDark;
    const textLight = config.tokens.colors.textLight;
    const goldTransparent = "#B89F5B30";
    const primaryTransparent = "#6B223230";
    const bgLight = config.tokens.colors.backgroundLight;
    const muted = config.tokens.colors.muted;
    const router = useRouter();
    const { createWine } = useRequest();
    const addWineToStore = useWineStore((state) => state.addWine);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [updateKey, setUpdateKey] = useState(0);
    const { t, forceUpdate } = useLanguageStore();

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

    const handlePickImageFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handlePickImageFromCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permissão necessária", "Ative a câmera para continuar");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
            setSelectedImage(result.assets[0].uri);
        }
    };

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

    const onSubmit = async (data: WineFormData) => {
        const fullData = {
            ...data,
            image: selectedImage || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        try {
            const createdWine = await createWine(fullData);
            addWineToStore(createdWine);
            Alert.alert("Vinho cadastrado!");
            router.push("/tabs/(tabs)/wines");
        } catch (error) {
            console.error("Erro ao cadastrar vinho:", error);
            Alert.alert("Erro", "Não foi possível cadastrar o vinho. Tente novamente.");
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

            <ScrollView>
                <VStack space="md">
                    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={keyboardVerticalOffset}>
                        {/* Nome do Vinho */}
                        <FormControl mb={12} isInvalid={!!errors.name}>
                            <FormControlLabel>
                                <FormControlLabelText>{t("forms.newWine.name")}</FormControlLabelText>
                            </FormControlLabel>
                            <Controller
                                control={control}
                                name="name"
                                render={({ field: { onChange, value } }) => (
                                    <Input bg="#FFFFFF" borderColor={muted}>
                                        <InputField bg="#FFFFFF" placeholder={t("forms.newWine.name")} value={value} onChangeText={onChange} />
                                    </Input>
                                )}
                            />
                            {errors.name && <Text color="$error500">{errors.name.message}</Text>}
                        </FormControl>

                        {/* Safra (Ano) com DateTimePicker */}
                        <FormControl mb={12} isInvalid={!!errors.harvest}>
                            <FormControlLabel>
                                <FormControlLabelText>{t("forms.newWine.harvest")}</FormControlLabelText>
                            </FormControlLabel>
                            <TouchableOpacity onPress={() => setShowYearPicker(true)}>
                                <Input bg="#FFFFFF" borderColor={muted} pointerEvents="none" alignItems="center">
                                    <InputField bg="#FFFFFF" placeholder="Selecione o ano" value={currentHarvest} editable={false} />
                                    <Calendar size={20} color={muted} style={{ marginRight: 10 }} />
                                </Input>
                            </TouchableOpacity>
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
                            {errors.harvest && <Text color="$error500">{errors.harvest.message}</Text>}
                        </FormControl>

                        <FormControl mb={12} isInvalid={!!errors.country}>
                            <FormControlLabel>
                                <FormControlLabelText>{t("forms.newWine.country")}</FormControlLabelText>
                            </FormControlLabel>
                            <TouchableOpacity onPress={() => setShowCountryModal(true)}>
                                <Input bg="#FFFFFF" borderColor={muted} pointerEvents="none" alignItems="center">
                                    <InputField bg="#FFFFFF" placeholder="Selecione o país" value={currentCountry} editable={false} />
                                    <ChevronDown size={20} color={muted} style={{ marginRight: 10 }} />
                                </Input>
                            </TouchableOpacity>
                            {errors.country && <Text color="$error500">{errors.country.message}</Text>}
                        </FormControl>

                        <FormControl mb={12} isInvalid={!!errors.grape}>
                            <FormControlLabel>
                                <FormControlLabelText>{t("forms.newWine.grape")}</FormControlLabelText>
                            </FormControlLabel>
                            <TouchableOpacity onPress={() => setShowGrapeModal(true)}>
                                <Input bg="#FFFFFF" borderColor={muted} pointerEvents="none" alignItems="center">
                                    <InputField bg="#FFFFFF" placeholder="Selecione a uva" value={currentGrape} editable={false} />
                                    <ChevronDown size={20} color={muted} style={{ marginRight: 10 }} />
                                </Input>
                            </TouchableOpacity>
                            {errors.grape && <Text color="$error500">{errors.grape.message}</Text>}
                        </FormControl>

                        <FormControl mb={12} isInvalid={!!errors.abv}>
                            <FormControlLabel>
                                <FormControlLabelText>{t("forms.newWine.abv")}</FormControlLabelText>
                            </FormControlLabel>
                            <Controller
                                control={control}
                                name="abv"
                                render={({ field: { onChange, value } }) => (
                                    <Input borderColor={muted}>
                                        <InputField bg="#FFFFFF" placeholder={t("forms.newWine.abv")} value={value} onChangeText={onChange} keyboardType="decimal-pad" />
                                    </Input>
                                )}
                            />
                            {errors.abv && <Text color="$error500">{errors.abv.message}</Text>}
                        </FormControl>

                        <FormControl isInvalid={!!errors.image}>
                            <FormControlLabel>
                                <FormControlLabelText>{t("forms.newWine.image")}</FormControlLabelText>
                            </FormControlLabel>
                            <HStack space="md" mt="$2">
                                <Button variant="solid" bgColor={neutralDark} onPress={handlePickImageFromCamera}>
                                    <ButtonText>{t("forms.newWine.camera")}</ButtonText>
                                </Button>
                                <Button variant="outline" borderColor={neutralDark} onPress={handlePickImageFromGallery}>
                                    <ButtonText color={neutralDark}>{t("forms.newWine.gallery")}</ButtonText>
                                </Button>
                            </HStack>
                            {selectedImage && (
                                <Box mt="$4" alignItems="center">
                                    <Image source={{ uri: selectedImage }} style={{ width: 160, height: 160, borderRadius: 8 }} resizeMode="cover" />
                                </Box>
                            )}
                        </FormControl>

                        <Button mt="$4" backgroundColor={neutralDark} onPress={handleSubmit(onSubmit)} borderColor="$error500">
                            <ButtonText>{t("forms.newWine.submit")}</ButtonText>
                        </Button>
                    </KeyboardAvoidingView>
                </VStack>
            </ScrollView>

            <Modal isOpen={showCountryModal} onClose={() => setShowCountryModal(false)}>
                <ModalBackdrop />
                <ModalContent>
                    <ModalHeader>
                        <Text fontWeight="bold">{t("forms.newWine.selectCountry")}</Text>
                    </ModalHeader>
                    <ModalBody>
                        <Input mb="$3" p={"$2"}>
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
                        <Button color="$error500" onPress={() => setShowCountryModal(false)} variant="outline" borderColor="$error500">
                            <ButtonText color="$error500">{t("general.cancel")}</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={showGrapeModal} onClose={() => setShowGrapeModal(false)}>
                <ModalBackdrop />
                <ModalContent>
                    <ModalHeader>
                        <Text fontWeight="bold">{t("forms.newWine.selectGrape")}</Text>
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
                        <Button onPress={() => setShowGrapeModal(false)} variant="outline" borderColor="$error500">
                            <ButtonText color="$error500">{t("general.cancel")}</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
