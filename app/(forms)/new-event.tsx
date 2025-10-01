import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Box,
    VStack,
    FormControl,
    Input,
    InputField,
    Textarea,
    TextareaInput,
    Button,
    ButtonText,
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectItem,
    HStack,
    Text,
    Checkbox,
    CheckboxIndicator,
    CheckboxIcon,
    CheckboxLabel,
    ScrollView,
    Divider,
    ButtonIcon,
    FormControlLabel,
    FormControlLabelText,
    Icon,
    Image,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Progress,
    ProgressFilledTrack,
    Card,
    Heading,
    Center,
} from "@gluestack-ui/themed";
import * as Location from "expo-location";
import { Alert, Platform, BackHandler } from "react-native";
import { FlatList } from "react-native";
import { CalendarDays, Wine, Plus, Clock, Calculator, ArrowLeft, Info, ChevronLeft } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useFocusEffect } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { config } from "@/gluestack-ui.config";
import WineCardForm from "@/components/WineCardForm";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRequest } from "@/hooks/useRequest";
import { useWineStore } from "@/stores/useWineStores";
import { useEvents } from "@/hooks/useEvents";
import { auth } from "@/lib/firebase";
import * as ImagePicker from "expo-image-picker";
import { uploadEventImage, validateImageForUpload } from "@/services/storage";
import * as Network from "expo-network";
import useLanguageStore from "@/stores/useLanguageStore";
import EventSearchBar from "@/components/EventSearchBar";

type Wine = {
    id?: string;
    name: string;
    harvest: string;
    country: string;
    type: string;
    description: string;
    image: string;
    grape?: string;
};

type Participant = {
    name: string;
    username: string;
    type: string;
    image: string;
};

type EventFormData = {
    name: string;
    organizerId: string;
    dateStart: string;
    dateEnd: string;
    wines: Wine[];
    participants: Participant[];
    status: "STARTED" | "CLOSED" | "CANCELED";
    calculator?: {
        guests: number;
        period: "morning" | "afternoon" | "evening";
        consumptionLevel: "low" | "medium" | "high";
    };
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    coverImage?: string;
};

const eventSchema = yup.object({
    name: yup.string().required("Nome do evento é obrigatório"),
    dateStart: yup.string().required("Data do evento é obrigatória"),
});
const primary = config.tokens.colors.primary["500"];
const neutralDark = config.tokens.colors.primary["600"];
const neutralLight = config.tokens.colors.primary["700"];
const accent = config.tokens.colors.primary["800"];
const gold = config.tokens.colors.primary["900"];
export const AndroidDateTimePicker = ({ visible, value, onConfirm, onCancel }: { visible: boolean; value?: Date | null; onConfirm: (d: Date) => void; onCancel: () => void }) => {
    const [phase, setPhase] = useState<"idle" | "date" | "time">("idle");
    const [tempDate, setTempDate] = useState<Date>(value ? new Date(value) : new Date());

    useEffect(() => {
        if (visible) {
            setTempDate(value ? new Date(value) : new Date());
            setPhase("date");
        } else {
            setPhase("idle");
        }
    }, [visible, value]);

    if (!visible) return null;

    if (phase === "date") {
        return (
            <DateTimePicker
                value={tempDate}
                mode="date"
                display="calendar"
                onChange={(event, date) => {
                    // evento cancelou
                    if (event.type === "dismissed") {
                        setPhase("idle");
                        onCancel();
                        return;
                    }
                    if (date) {
                        setTempDate((prev) => {
                            const newDate = new Date(prev);
                            newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                            return newDate;
                        });
                        setPhase("time");
                    }
                }}
            />
        );
    }

    if (phase === "time") {
        return (
            <DateTimePicker
                value={tempDate}
                mode="time"
                display="clock"
                is24Hour={true}
                onChange={(event, date) => {
                    if (event.type === "dismissed") {
                        setPhase("idle");
                        onCancel();
                        return;
                    }
                    if (date) {
                        const final = new Date(tempDate);
                        final.setHours(date.getHours(), date.getMinutes(), 0, 0);
                        setPhase("idle");
                        onConfirm(final);
                    }
                }}
            />
        );
    }

    return null;
};

const DatePickerModalIOS = ({ visible, onClose, value, onConfirm, mode = "datetime" }) => {
    const [selectedDate, setSelectedDate] = useState(value || new Date());
    const { t, forceUpdate } = useLanguageStore();

    return (
        <Modal isOpen={visible} onClose={onClose}>
            <ModalBackdrop />
            <ModalContent>
                <ModalHeader>
                    <Text fontSize="$lg" fontWeight="$bold">
                        {t("forms.newEvent.selectDate")}
                    </Text>
                </ModalHeader>
                <ModalBody>
                    <DateTimePicker
                        value={selectedDate}
                        mode={mode}
                        display="spinner"
                        accentColor={gold}
                        themeVariant="light"
                        onChange={(event, date) => {
                            if (date) {
                                setSelectedDate(date);
                            }
                        }}
                        style={{
                            height: 200,
                            width: "100%",
                        }}
                    />
                </ModalBody>
                <ModalFooter flexDirection="row">
                    <Button variant="outline" borderColor="$error500" onPress={onClose} mr="$3">
                        <ButtonText color="$error500">{t("general.cancel")}</ButtonText>
                    </Button>
                    <Button
                        bgColor={gold}
                        onPress={() => {
                            onConfirm(selectedDate);
                            onClose();
                        }}
                    >
                        <ButtonText>{t("general.confirm")}</ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const DatePickerAndroid = ({ visible, value, onConfirm, onCancel, mode = "datetime" }) => {
    const [internalDate, setInternalDate] = useState(value || new Date());

    useEffect(() => {
        if (value) {
            setInternalDate(new Date(value));
        }
    }, [value]);

    if (!visible) return null;

    return (
        <DateTimePicker
            value={internalDate}
            mode={mode}
            display="default"
            onChange={(event, date) => {
                if (event.type === "set" && date) {
                    onConfirm(date);
                } else {
                    onCancel();
                }
            }}
        />
    );
};

const StepInstructions = ({ step, title, description }) => {
    return (
        <Box mb="$6">
            <HStack alignItems="center" space="sm" mb="$2">
                <Center w="$6" h="$6" borderRadius="$full" bg={gold}>
                    <Text color="$white" fontWeight="$bold">
                        {step}
                    </Text>
                </Center>
                <Heading color={neutralDark} size="lg">
                    {title}
                </Heading>
            </HStack>
            <Text color={neutralDark}>{description}</Text>
        </Box>
    );
};

export default function EventForm() {
    const router = useRouter();
    const { createEvent } = useRequest();
    const { refreshEvents } = useEvents();
    const [showDatePickerModal, setShowDatePickerModal] = useState(false);
    const [showDateEndPickerModal, setShowDateEndPickerModal] = useState(false);
    const [showCalculatorModal, setShowCalculatorModal] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "wines">("details");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [pickerMode, setPickerMode] = useState<"dateStart" | "dateEnd">("dateStart");
    const { t, forceUpdate } = useLanguageStore();
    const primary = config.tokens.colors.primary?.["500"];
    const goldTransparent = "#B89F5B30";
    const primaryTransparent = "#6B223230";
    const accent = config.tokens.colors.primary["800"];
    const bgLight = config.tokens.colors.backgroundLight;
    const user = auth.currentUser;
    const [updateKey, setUpdateKey] = useState(0);
    const userWines = useWineStore((state) => state.userWines);
    const fetchUserWines = useWineStore((state) => state.fetchUserWines);
    const loading = useWineStore((state) => state.loading);
    const error = useWineStore((state) => state.error);

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<EventFormData>({
        resolver: yupResolver(eventSchema),
        defaultValues: {
            name: "",
            organizerId: user?.uid || "",
            dateStart: new Date().toISOString(),
            dateEnd: "",
            wines: [],
            participants: [],
            status: "STARTED",
            calculator: {
                guests: 0,
                period: "evening",
                consumptionLevel: "medium",
            },
        },
    });

    const formValues = watch();

    useEffect(() => {
        const backAction = () => {
            router.replace("/tabs/(tabs)/home");
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, []);

    const getCorrectUri = (uri: string) => {
        if (Platform.OS === "ios") {
            return uri.replace("file://", "");
        }
        return uri;
    };

    const handlePickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("Permissão necessária", "Precisamos acessar sua galeria para selecionar uma imagem");
                return;
            }

            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                allowsMultipleSelection: false,
            });

            if (!pickerResult.canceled && pickerResult.assets.length > 0) {
                const selectedUri = pickerResult.assets[0].uri;
                const isValid = await validateImageForUpload(selectedUri);

                if (!isValid) {
                    Alert.alert("Erro", "Imagem inválida ou muito grande (máximo 5MB)");
                    return;
                }

                setSelectedImage(selectedUri);
            }
        } catch (error) {
            console.error("Erro ao selecionar imagem:", error);
            Alert.alert("Erro", "Não foi possível selecionar a imagem");
        }
    };

    const handleTakePhoto = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("Permissão necessária", "Precisamos acessar sua câmera para tirar uma foto");
                return;
            }

            const pickerResult = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!pickerResult.canceled && pickerResult.assets.length > 0) {
                const selectedUri = pickerResult.assets[0].uri;
                const isValid = await validateImageForUpload(selectedUri);

                if (!isValid) {
                    Alert.alert("Erro", "Imagem inválida ou muito grande (máximo 5MB)");
                    return;
                }

                setSelectedImage(selectedUri);
            }
        } catch (error) {
            console.error("Erro ao tirar foto:", error);
            Alert.alert("Erro", "Não foi possível tirar a foto");
        }
    };

    useEffect(() => {
        const getLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setValue("location", {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            let address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (address[0]) {
                setValue("location.address", `${address[0].street}, ${address[0].city}`);
            }
        };

        getLocation();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (user?.uid) {
                fetchUserWines(user.uid);
            }
        }, [fetchUserWines, user?.uid])
    );

    const handleAddWine = (wine: Wine) => {
        const isAlreadyAdded = formValues.wines.some((addedWine) => addedWine.id === wine.id);

        if (!isAlreadyAdded) {
            setValue("wines", [
                ...formValues.wines,
                {
                    id: wine.id,
                    name: wine.name,
                    harvest: wine.harvest || "",
                    country: wine.country || "",
                    type: wine.type || "",
                    description: wine.description || "",
                    image: wine.image || "",
                    grape: wine.grape || "",
                },
            ]);
        } else {
            Alert.alert("Aviso", "Este vinho já foi adicionado ao evento.");
        }
    };

    const handleRemoveWine = (index: number) => {
        const wineName = formValues.wines[index].name;
        const newWines = [...formValues.wines];
        newWines.splice(index, 1);
        setValue("wines", newWines);
    };

    const onSubmit = async (data: EventFormData) => {
        try {
            const networkState = await Network.getNetworkStateAsync();
            if (!networkState.isConnected) {
                throw new Error("Sem conexão com a internet");
            }

            if (!user?.uid) {
                throw new Error("Usuário não autenticado");
            }

            setIsUploadingImage(true);
            let coverImageUrl = null;

            if (selectedImage) {
                try {
                    const correctedUri = getCorrectUri(selectedImage);
                    coverImageUrl = await uploadEventImage(correctedUri, user.uid);
                } catch (uploadError) {
                    console.error("Erro no upload da imagem:", uploadError);
                    Alert.alert("Aviso", "Não foi possível enviar a imagem. O evento será criado sem ela.", [{ text: "OK" }]);
                }
            }

            const eventData = {
                ...data,
                organizerId: user.uid,
                coverImage: coverImageUrl || null,
                wines: data.wines.map((wine) => ({
                    ...wine,
                    image: wine.image || null,
                })),
            };

            const newEvent = await createEvent(eventData);
            await refreshEvents();

            Alert.alert("Sucesso", "Evento criado com sucesso!");
            router.push(`/tabs/${newEvent?.id}/event-room`);
        } catch (error: any) {
            console.error("Erro ao criar evento:", error);
            Alert.alert(
                "Erro",
                error.message?.includes("upload")
                    ? "Erro ao enviar imagem. Tente novamente ou use outra imagem."
                    : error.message?.includes("conexão")
                    ? "Verifique sua conexão com a internet e tente novamente."
                    : "Erro ao criar evento. Tente novamente."
            );
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleNext = handleSubmit((data) => {
        if (activeTab === "details") {
            setActiveTab("wines");
        } else if (activeTab === "wines") {
            onSubmit(data);
        }
    });

    const handlePrevious = () => {
        if (activeTab === "details") {
            router.push("/tabs/(tabs)/home");
        } else if (activeTab === "wines") {
            setActiveTab("details");
        }
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return t("forms.newEvent.selectDate");

        const date = new Date(dateString);
        return `${date.toLocaleDateString("pt-BR")} - ${date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        })}`;
    };

    const openDateTimePicker = (field: "dateStart" | "dateEnd") => {
        setPickerMode(field);

        const currentValue = formValues[field];
        setTempDate(currentValue ? new Date(currentValue) : new Date());

        if (Platform.OS === "ios") {
            if (field === "dateStart") {
                setShowDatePickerModal(true);
            } else {
                setShowDateEndPickerModal(true);
            }
        } else {
            if (field === "dateStart") {
                setShowDatePickerModal(true);
            } else {
                setShowDateEndPickerModal(true);
            }
        }
    };

    const handleDateTimeConfirm = (date: Date) => {
        if (pickerMode === "dateStart") {
            setValue("dateStart", date.toISOString());
        } else {
            setValue("dateEnd", date.toISOString());
        }

        setShowDatePickerModal(false);
        setShowDateEndPickerModal(false);
    };

    const handleDateTimeCancel = () => {
        setShowDatePickerModal(false);
        setShowDateEndPickerModal(false);
    };

    const [query, setQuery] = useState("");

    const filteredUserWines = useMemo(() => {
        const q = (query || "").trim().toLowerCase();

        const addedIds = new Set((formValues.wines || []).map((w: any) => w.id));

        const available = (userWines || []).filter((uw: any) => !addedIds.has(uw.id));

        if (!q) return available;

        return available.filter((w: any) => {
            const name = (w?.name || "").toString().toLowerCase();
            const grape = (w?.grape || w?.variety || "").toString().toLowerCase();
            const producer = (w?.producer || w?.winery || "").toString().toLowerCase();
            const region = (w?.region || w?.country || "").toString().toLowerCase();
            const vintage = (w?.vintage || w?.year || "").toString().toLowerCase();

            return name.includes(q) || grape.includes(q) || producer.includes(q) || region.includes(q) || vintage.includes(q);
        });
    }, [userWines, formValues.wines, query]);

    return (
        <>
            <Box key={updateKey} bgColor={neutralLight} flex={1} p="$4" mt={Platform.OS == "ios" ? 70 : 0}>
                <Box mb="$6">
                    <HStack justifyContent="space-between" alignItems="center" mb="$2">
                        <Button variant="link" onPress={handlePrevious} p="$0">
                            <ButtonIcon as={ChevronLeft} size={30} style={{ marginRight: 6 }} color={gold} />
                        </Button>
                        <Heading color={gold} size="xl">
                            {t("forms.newEvent.titleForm")}
                        </Heading>
                        <Box w="$8" />
                    </HStack>

                    <Box mb="$6">
                        <HStack justifyContent="space-between" alignItems="center" mb="$2">
                            <Text fontWeight="$bold" color={activeTab === "details" ? primary : neutralDark}>
                                {t("forms.newEvent.title")}
                            </Text>
                            <Text fontWeight="$bold" color={activeTab === "wines" ? primary : neutralDark}>
                                {t("forms.newEvent.title2")}
                            </Text>
                        </HStack>
                        <Progress value={activeTab === "details" ? 50 : 100} w="$full" h="$1">
                            <ProgressFilledTrack bgColor={primary} />
                        </Progress>
                    </Box>
                </Box>

                <ScrollView py={0} mb="$16">
                    {activeTab === "details" && (
                        <VStack space="md">
                            <StepInstructions step="1" title={t("forms.newEvent.buttonDetails")} description={t("forms.newEvent.buttonDetailsDescription")} />

                            <Card p="$4" mb="$4">
                                <FormControl isInvalid={!!errors.name} mb="$4">
                                    <FormControlLabel>
                                        <FormControlLabelText fontWeight="$bold">{t("forms.newEvent.placeholderName")} *</FormControlLabelText>
                                    </FormControlLabel>
                                    <Controller
                                        control={control}
                                        name="name"
                                        render={({ field: { onChange, value } }) => (
                                            <Input borderColor={"$backgroundDark400"}>
                                                <InputField placeholder={t("forms.newEvent.placeholderName")} value={value} onChangeText={onChange} />
                                            </Input>
                                        )}
                                    />
                                    {errors.name && (
                                        <Text color="$error500" fontSize="$sm" mt="$1">
                                            {errors.name.message}
                                        </Text>
                                    )}
                                </FormControl>

                                <FormControl isInvalid={!!errors.dateStart} mb="$4">
                                    <FormControlLabel>
                                        <FormControlLabelText fontWeight="$bold">{t("forms.newEvent.dateStart")} *</FormControlLabelText>
                                    </FormControlLabel>
                                    <Controller
                                        control={control}
                                        name="dateStart"
                                        render={({ field: { value } }) => (
                                            <>
                                                <Button bgColor={gold} borderColor={gold} borderWidth="$1" onPress={() => openDateTimePicker("dateStart")}>
                                                    <ButtonIcon as={CalendarDays} mr="$2" color={"#FFFFFF"} />
                                                    <ButtonText color={neutralLight}>{formatDateTime(value)}</ButtonText>
                                                </Button>

                                                {Platform.OS === "ios" && (
                                                    <DatePickerModalIOS
                                                        visible={showDatePickerModal && pickerMode === "dateStart"}
                                                        onClose={() => setShowDatePickerModal(false)}
                                                        value={tempDate}
                                                        onConfirm={handleDateTimeConfirm}
                                                        mode="datetime"
                                                    />
                                                )}

                                                {Platform.OS === "android" && (
                                                    <AndroidDateTimePicker
                                                        visible={showDatePickerModal && pickerMode === "dateStart"} // para dateStart
                                                        value={tempDate ?? new Date()}
                                                        onConfirm={(date) => {
                                                            setValue("dateStart", date.toISOString());
                                                            setShowDatePickerModal(false);
                                                        }}
                                                        onCancel={() => {
                                                            setShowDatePickerModal(false);
                                                        }}
                                                    />
                                                )}
                                            </>
                                        )}
                                    />
                                    {errors.dateStart && (
                                        <Text color="$error500" fontSize="$sm" mt="$1">
                                            {errors.dateStart.message}
                                        </Text>
                                    )}
                                </FormControl>

                                <FormControl mb="$4">
                                    <FormControlLabel>
                                        <FormControlLabelText fontWeight="$bold">{t("forms.newEvent.date")}</FormControlLabelText>
                                    </FormControlLabel>
                                    <Controller
                                        control={control}
                                        name="dateEnd"
                                        render={({ field: { value } }) => (
                                            <>
                                                <Button bgColor={gold} borderColor={gold} borderWidth="$1" onPress={() => openDateTimePicker("dateEnd")}>
                                                    <ButtonIcon as={CalendarDays} mr="$2" color="#FFFFFF" />
                                                    <ButtonText color={neutralLight}>{formatDateTime(value)}</ButtonText>
                                                </Button>

                                                {Platform.OS === "ios" && (
                                                    <DatePickerModalIOS
                                                        visible={showDateEndPickerModal && pickerMode === "dateEnd"}
                                                        onClose={() => setShowDateEndPickerModal(false)}
                                                        value={tempDate}
                                                        onConfirm={handleDateTimeConfirm}
                                                        mode="datetime"
                                                    />
                                                )}

                                                {Platform.OS === "android" && (
                                                    <AndroidDateTimePicker
                                                        visible={showDateEndPickerModal && pickerMode === "dateEnd"}
                                                        value={tempDate ?? new Date()}
                                                        onConfirm={(date) => {
                                                            setValue("dateEnd", date.toISOString());
                                                            setShowDateEndPickerModal(false);
                                                        }}
                                                        onCancel={() => {
                                                            setShowDateEndPickerModal(false);
                                                        }}
                                                    />
                                                )}
                                            </>
                                        )}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormControlLabel>
                                        <FormControlLabelText fontWeight="$bold" color={neutralDark}>
                                            {t("forms.newEvent.titleImage")}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Text fontSize="$sm" color={neutralDark} mb="$2">
                                        {t("forms.newEvent.imageDescription")}
                                    </Text>

                                    <HStack space="sm" mt="$2">
                                        <Button variant="solid" bgColor={gold} onPress={handleTakePhoto} isDisabled={isUploadingImage}>
                                            <ButtonText color={neutralLight}>{t("forms.newEvent.camera")}</ButtonText>
                                        </Button>
                                        <Button variant="outline" borderColor={gold} onPress={handlePickImage} isDisabled={isUploadingImage}>
                                            <ButtonText color={gold}>{t("forms.newEvent.gallery")}</ButtonText>
                                        </Button>
                                    </HStack>

                                    {selectedImage && (
                                        <Box mt="$4" alignItems="center">
                                            <Image
                                                source={{ uri: selectedImage }}
                                                style={{
                                                    width: 200,
                                                    height: 150,
                                                    borderRadius: 8,
                                                    marginTop: 8,
                                                }}
                                                resizeMode="cover"
                                                alt="Imagem selecionada"
                                            />
                                            <Text fontSize="$sm" color="$text600" mt="$2">
                                                {t("forms.newEvent.selectedImage")}
                                            </Text>
                                        </Box>
                                    )}
                                </FormControl>
                            </Card>

                            <Box bg={goldTransparent} borderColor={gold} borderWidth={1} p="$4" borderRadius="$md" mt="$4">
                                <HStack space="sm" alignItems="flex-start">
                                    <Icon as={Info} color={gold} mt="$0.5" />
                                    <VStack flex={1}>
                                        <Text fontWeight="$bold" color={gold}>
                                            {t("forms.newEvent.nextStep")}
                                        </Text>
                                        <Text fontSize="$sm" color={gold}>
                                            {t("forms.newEvent.nextStepDescription")}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Box>
                        </VStack>
                    )}

                    {activeTab === "wines" && (
                        <VStack space="md">
                            <StepInstructions step="2" title={t("forms.newEvent.eventWines")} description={t("forms.newEvent.eventWinesDescription")} />

                            <Card p="$4" mb="$4">
                                <Heading size="md" mb="$4" color={neutralDark}>
                                    {t("forms.newEvent.addedWines")} ({formValues.wines.length})
                                </Heading>

                                {formValues.wines.length === 0 ? (
                                    <Box bg={goldTransparent} p="$4" borderRadius="$md">
                                        <Text textAlign="center" color={gold}>
                                            {t("forms.newEvent.emptyList")}
                                        </Text>
                                    </Box>
                                ) : (
                                    <FlatList
                                        data={formValues.wines}
                                        keyExtractor={(item, index) => (item.id ? item.id.toString() : `added-${index}`)}
                                        renderItem={({ item, index }) => (
                                            <WineCardForm
                                                key={item.id ? `added-${item.id}` : `added-${index}`}
                                                wine={item}
                                                onPress={() => handleRemoveWine(index)}
                                                isAdded={true}
                                                showRemoveButton={true}
                                            />
                                        )}
                                        showsHorizontalScrollIndicator={false}
                                    />
                                )}
                            </Card>

                            <Card p="$4" mb="$4">
                                <Heading size="md" mb="$4">
                                    {t("forms.newEvent.yourWines")}
                                </Heading>
                                <Text fontSize="$sm" color="$text600" mb="$4">
                                    {t("forms.newEvent.selectWines")}
                                </Text>

                                <EventSearchBar value={query} onChange={setQuery} placeholder={t("forms.newEvent.searchPlaceholder")} />

                                {loading && (
                                    <Box p="$4" alignItems="center">
                                        <Text>{t("general.loading")}</Text>
                                    </Box>
                                )}

                                {error && (
                                    <Box bg="$error50" p="$4" borderRadius="$md" mb="$4">
                                        <Text color="$error500">{error}</Text>
                                    </Box>
                                )}

                                {!loading && !error && (
                                    <FlatList
                                        data={filteredUserWines}
                                        keyExtractor={(item) => (item.id ? item.id.toString() : `available-${Math.random()}`)}
                                        ListEmptyComponent={
                                            query ? (
                                                <Box bg="$primary50" p="$4" borderRadius="$md">
                                                    <Text textAlign="center" color="$primary700">
                                                        {t("forms.newEvent.notFound")} "{query}"
                                                    </Text>
                                                </Box>
                                            ) : (
                                                <Box bg="$primary50" p="$4" borderRadius="$md">
                                                    <Text textAlign="center" color="$primary700">
                                                        {t("forms.newEvent.noWines")}
                                                    </Text>
                                                </Box>
                                            )
                                        }
                                        renderItem={({ item }) => {
                                            let imageSource = null;
                                            if (typeof item.image === "string") {
                                                imageSource = { uri: item.image };
                                            } else if (item.image) {
                                                imageSource = item.image;
                                            }
                                            const wineWithNormalizedImage = { ...item, image: imageSource };

                                            return <WineCardForm wine={wineWithNormalizedImage} onPress={() => handleAddWine(item)} isAdded={false} showAddButton={true} />;
                                        }}
                                        showsHorizontalScrollIndicator={false}
                                    />
                                )}
                            </Card>

                            <Card p="$4">
                                <Heading size="md" mb="$4">
                                    {t("forms.newEvent.addWine")}
                                </Heading>
                                <Text fontSize="$sm" color="$text600" mb="$4">
                                    {t("forms.newEvent.addWineDescription")}
                                </Text>

                                <Button backgroundColor={gold} onPress={() => router.push("/(forms)/new-wine-event")}>
                                    <ButtonText>{t("forms.newEvent.addWine")}</ButtonText>
                                    <ButtonIcon as={Plus} ml="$2" />
                                </Button>
                            </Card>
                        </VStack>
                    )}
                </ScrollView>
            </Box>
            <HStack
                space="sm"
                mt="$8"
                pb={12}
                px={36}
                position="absolute"
                bottom={3}
                bg={bgLight}
                minWidth="$full"
                alignSelf="center"
                alignItems="flex-start"
                justifyContent="space-between"
                backgroundColor={"#F7F7F7"}
                zIndex={999}
            >
                <Button mt="$2" size="lg" borderColor={gold} onPress={handlePrevious} variant="outline" disabled={isUploadingImage}>
                    <ButtonText color={gold}>{activeTab === "details" ? t("general.cancel") : t("forms.newEvent.buttonBack")}</ButtonText>
                </Button>

                <Button mt="$2" size="lg" bgColor={gold} onPress={handleNext} isDisabled={isUploadingImage || (activeTab === "details" && !formValues.name)}>
                    <ButtonText color="white">
                        {isUploadingImage ? "Processando..." : activeTab === "details" ? t("forms.newEvent.buttonNext") : t("forms.newEvent.buttonSubmit")}
                    </ButtonText>
                </Button>
            </HStack>
        </>
    );
}
