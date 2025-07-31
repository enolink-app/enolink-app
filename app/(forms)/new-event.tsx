import { useState, useEffect, useCallback } from "react";
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
} from "@gluestack-ui/themed";
import * as Location from "expo-location";
import { Alert, Platform } from "react-native";
import { FlatList } from "react-native";
import { CalendarDays, Wine, Plus, Clock, Calculator } from "lucide-react-native";
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
import { BackHandler } from "react-native";

type Wine = {
    id?: string;
    name: string;
    harvest: string;
    country: string;
    type: string;
    description: string;
    image: string;
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

export default function EventForm() {
    const router = useRouter();
    const { createEvent } = useRequest();
    const { refreshEvents } = useEvents();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCalculatorModal, setShowCalculatorModal] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "wines">("details");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const primary = config.tokens.colors.primary?.["500"];
    const bgLight = config.tokens.colors.backgroundLight;
    const user = auth.currentUser;

    const userWines = useWineStore((state) => state.userWines);
    const fetchUserWines = useWineStore((state) => state.fetchUserWines);
    const loading = useWineStore((state) => state.loading);
    const error = useWineStore((state) => state.error);

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
            dateStart: new Date().toISOString().split("T")[0],
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
            return true; // Impede o comportamento padrão de voltar
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
                console.log("Permissão de localização negada");
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
            },
        ]);
    };

    const handleRemoveWine = (index: number) => {
        const newWines = [...formValues.wines];
        newWines.splice(index, 1);
        setValue("wines", newWines);
    };

    const onSubmit = async (data: EventFormData) => {
        try {
            // Verificar conexão com a internet
            const networkState = await Network.getNetworkStateAsync();
            if (!networkState.isConnected) {
                throw new Error("Sem conexão com a internet");
            }

            // Verificar autenticação
            if (!user?.uid) {
                throw new Error("Usuário não autenticado");
            }

            setIsUploadingImage(true);
            let coverImageUrl = null;

            // Upload da imagem (se existir)
            if (selectedImage) {
                try {
                    const correctedUri = getCorrectUri(selectedImage);
                    coverImageUrl = await uploadEventImage(correctedUri, user.uid);
                    console.log("Upload da imagem concluído:", coverImageUrl);
                } catch (uploadError) {
                    console.error("Erro no upload da imagem:", uploadError);
                    Alert.alert("Aviso", "Não foi possível enviar a imagem. O evento será criado sem ela.", [{ text: "OK" }]);
                }
            }

            // Criar o evento
            const eventData = {
                ...data,
                organizerId: user.uid,
                coverImage: coverImageUrl || null,
                wines: data.wines.map((wine) => ({
                    ...wine,
                    image: wine.image || null,
                })),
            };

            await createEvent(eventData);
            await refreshEvents();

            Alert.alert("Sucesso", "Evento criado com sucesso!");
            router.push("/tabs/(tabs)/home");
        } catch (error) {
            console.error("Erro ao criar evento:", error);
            Alert.alert(
                "Erro",
                error.message.includes("upload")
                    ? "Erro ao enviar imagem. Tente novamente ou use outra imagem."
                    : error.message.includes("conexão")
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

    return (
        <Box flex={1} p="$4" mt={70}>
            {/* Abas de navegação */}
            <HStack
                space="sm"
                mb="$8"
                position="absolute"
                top={3}
                bg={bgLight}
                w="$full"
                alignSelf="center"
                justifyContent="space-between"
                backgroundColor={"#FFF8EC"}
                zIndex={999}
            >
                <Button
                    backgroundColor={activeTab === "details" ? primary : "white"}
                    borderColor={primary}
                    variant={activeTab === "details" ? "solid" : "outline"}
                    onPress={() => setActiveTab("details")}
                >
                    <ButtonText color={activeTab === "details" ? "white" : primary}>Detalhes</ButtonText>
                </Button>
                <Button
                    backgroundColor={activeTab === "wines" ? primary : "white"}
                    borderColor={primary}
                    variant={activeTab === "wines" ? "solid" : "outline"}
                    onPress={() => (activeTab === "details" ? handleNext() : setActiveTab("wines"))}
                >
                    <ButtonText color={activeTab === "wines" ? "white" : primary}>Vinhos</ButtonText>
                </Button>
            </HStack>

            <ScrollView py={32} mb="$16">
                {activeTab === "details" && (
                    <VStack space="md">
                        <Text fontSize="$xl" fontWeight="$bold">
                            Detalhes do Evento
                        </Text>

                        {/* Nome do Evento */}
                        <FormControl isInvalid={!!errors.name}>
                            <Controller
                                control={control}
                                name="name"
                                render={({ field: { onChange, value } }) => (
                                    <Input borderColor={"$backgroundDark400"}>
                                        <InputField placeholder="Nome do evento*" value={value} onChangeText={onChange} />
                                    </Input>
                                )}
                            />
                            {errors.name && (
                                <Text color="$error500" fontSize="$sm">
                                    {errors.name.message}
                                </Text>
                            )}
                        </FormControl>

                        {/* Data do Evento */}
                        <FormControl isInvalid={!!errors.dateStart}>
                            <Controller
                                control={control}
                                name="dateStart"
                                render={({ field: { value } }) => (
                                    <>
                                        <Button onPress={() => setShowDatePicker(true)}>
                                            <ButtonIcon as={CalendarDays} mr="$2" />
                                            <ButtonText>{new Date(value).toLocaleDateString("pt-BR")}</ButtonText>
                                        </Button>
                                        {showDatePicker && (
                                            <DateTimePicker
                                                accentColor={primary}
                                                value={new Date(value)}
                                                mode="date"
                                                display="default"
                                                onChange={(_, date) => {
                                                    setShowDatePicker(false);
                                                    if (date) {
                                                        setValue("dateStart", date.toISOString().split("T")[0]);
                                                    }
                                                }}
                                            />
                                        )}
                                    </>
                                )}
                            />
                            {errors.dateStart && (
                                <Text color="$error500" fontSize="$sm">
                                    {errors.dateStart.message}
                                </Text>
                            )}
                        </FormControl>

                        {/* Data Final (opcional) */}
                        <FormControl>
                            <Controller
                                control={control}
                                name="dateEnd"
                                render={({ field: { onChange, value } }) => (
                                    <Input borderColor={"$backgroundDark400"} mt="$2">
                                        <InputField placeholder="Data final (opcional)" value={value} onChangeText={onChange} />
                                    </Input>
                                )}
                            />
                        </FormControl>

                        {/* Upload de Imagem */}
                        <FormControl>
                            <FormControlLabel>
                                <FormControlLabelText>Imagem de Capa (opcional)</FormControlLabelText>
                            </FormControlLabel>

                            <HStack space="sm" mt="$2">
                                <Button variant="solid" bgColor={primary} onPress={handleTakePhoto} isDisabled={isUploadingImage}>
                                    <ButtonText color="white">Tirar Foto</ButtonText>
                                </Button>
                                <Button variant="outline" borderColor={primary} onPress={handlePickImage} isDisabled={isUploadingImage}>
                                    <ButtonText color={primary}>Escolher da Galeria</ButtonText>
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
                                </Box>
                            )}
                        </FormControl>
                    </VStack>
                )}

                {activeTab === "wines" && (
                    <VStack space="md">
                        <Text fontSize="$xl" fontWeight="$bold">
                            Vinhos do Evento
                        </Text>

                        {/* Vinhos adicionados */}
                        <VStack space="sm">
                            <FlatList
                                data={formValues.wines}
                                keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                                ListEmptyComponent={
                                    <Box>
                                        <Text>Nenhum vinho adicionado</Text>
                                    </Box>
                                }
                                renderItem={({ item, index }) => <WineCardForm key={index} wine={item} onPress={() => handleRemoveWine(index)} />}
                                showsHorizontalScrollIndicator={false}
                            />
                        </VStack>

                        <Divider my="$4" />

                        {/* Lista de vinhos do usuário */}
                        <Text fontSize="$lg" mb="$2">
                            Seus Vinhos
                        </Text>
                        {loading && <Text>Carregando vinhos...</Text>}
                        {error && <Text color="$error500">Erro: {error}</Text>}
                        {!loading && !error && (
                            <FlatList
                                data={userWines}
                                keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                                ListEmptyComponent={
                                    <Box>
                                        <Text>Seus vinhos cadastrados aparecerão aqui</Text>
                                    </Box>
                                }
                                renderItem={({ item }) => {
                                    // Normalize wine.image to a URI string or require object
                                    let imageSource = null;
                                    if (typeof item.image === "string") {
                                        imageSource = { uri: item.image };
                                    } else if (item.image) {
                                        imageSource = item.image;
                                    }
                                    const wineWithNormalizedImage = { ...item, image: imageSource };
                                    return <WineCardForm wine={wineWithNormalizedImage} onPress={() => handleAddWine(item)} />;
                                }}
                                showsHorizontalScrollIndicator={false}
                            />
                        )}

                        {/* Botão para adicionar novo vinho */}
                        <Button mt="$4" backgroundColor={primary} onPress={() => router.push("/(forms)/new-wine-event")}>
                            <ButtonText>Adicionar Novo Vinho</ButtonText>
                            <ButtonIcon as={Plus} mr="$2" />
                        </Button>
                    </VStack>
                )}
            </ScrollView>

            {/* Botões de navegação */}
            <HStack
                space="sm"
                mt="$8"
                pb={12}
                px={6}
                position="absolute"
                bottom={3}
                bg={bgLight}
                w="$full"
                alignSelf="center"
                alignItems="flex-start"
                justifyContent="space-between"
                backgroundColor={"#FFF8EC"}
                zIndex={999}
            >
                <Button mt="$2" size="lg" borderColor={primary} onPress={handlePrevious} variant="outline">
                    <ButtonText color={primary}>Voltar</ButtonText>
                </Button>
                <Button mt="$2" size="lg" bgColor={primary} onPress={handleNext} isDisabled={isUploadingImage}>
                    <ButtonText color="white">{isUploadingImage ? "Enviando imagem..." : activeTab === "details" ? "Próximo" : "Criar Evento"}</ButtonText>
                </Button>
            </HStack>
        </Box>
    );
}
