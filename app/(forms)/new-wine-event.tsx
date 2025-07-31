import { useState } from "react";
import { Box, Heading, VStack, HStack, FormControl, FormControlLabel, FormControlLabelText, Input, InputField, Button, ButtonText, Text } from "@gluestack-ui/themed";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert } from "react-native";
import { config } from "@/gluestack-ui.config";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { useRequest } from "@/hooks/useRequest";
import { useNavigation, useRouter } from "expo-router";
import { useWineStore } from "@/stores/useWineStores";
import { uploadImage } from "@/services/storage";
import { auth } from "@/lib/firebase";

const wineSchema = yup.object({
    name: yup.string().required("Nome é obrigatório"),
    harvest: yup
        .string()
        .matches(/^\d{4}$/, "Informe o ano com 4 dígitos")
        .required("Safra é obrigatória"),
    country: yup.string().required("País é obrigatório"),
    grape: yup.string().required("Variação da uva é obrigatória"),
    closure: yup.string().required("Vedação é obrigatória"),
    type: yup.string().required("Tipo de vinho é obrigatório"),
    image: yup.string().nullable().optional(),
});

type WineFormData = yup.InferType<typeof wineSchema>;

export default function AddWineScreen() {
    const { createWine } = useRequest();
    const router = useRouter();
    const primary = config.tokens.colors.primary?.["500"];
    const muted = config.tokens.colors.muted;
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const addWineToStore = useWineStore((state) => state.addWine);

    const handlePickImageFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
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
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<WineFormData>({
        resolver: yupResolver(wineSchema),
        defaultValues: {
            name: "",
            harvest: "",
            country: "",
            type: "",
            grape: "",
            closure: "",
            image: null,
        },
    });

    const onSubmit = async (data: WineFormData) => {
        if (isUploading) return;

        setIsUploading(true);

        try {
            let imageUrl = null;

            // Faz upload da imagem se existir
            if (selectedImage) {
                const userId = auth.currentUser?.uid || "unknown";
                const timestamp = Date.now();
                const path = `wines/${userId}_${timestamp}.jpg`;

                imageUrl = await uploadImage(selectedImage, path);
            }

            const fullData = {
                ...data,
                image: imageUrl, // Armazena apenas a URL
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const createdWine = await createWine(fullData);
            addWineToStore(createdWine);

            Alert.alert("Sucesso", "Vinho cadastrado com sucesso!");
            router.back();
        } catch (error) {
            console.error("Erro ao cadastrar vinho:", error);
            Alert.alert("Erro", "Não foi possível cadastrar o vinho. Verifique os dados e tente novamente.");
        } finally {
            setIsUploading(false);
        }
    };
    return (
        <Box flex={1} bg="$backgroundLight" p="$4">
            <Heading size="lg" mb="$4">
                Adicionar Vinho
            </Heading>
            <VStack space="md">
                <FormControl isInvalid={!!errors.name}>
                    <FormControlLabel>
                        <FormControlLabelText>Nome*</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <Input borderColor={muted}>
                                <InputField placeholder="Ex: Dom Perignon" value={value} onChangeText={onChange} />
                            </Input>
                        )}
                    />
                    {errors.name && <Text color="$error500">{errors.name.message}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.harvest}>
                    <FormControlLabel>
                        <FormControlLabelText>Safra (ano)*</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="harvest"
                        render={({ field: { onChange, value } }) => (
                            <Input borderColor={muted}>
                                <InputField placeholder="Ex: 2020" value={value} onChangeText={onChange} keyboardType="numeric" />
                            </Input>
                        )}
                    />
                    {errors.harvest && <Text color="$error500">{errors.harvest.message}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.country}>
                    <FormControlLabel>
                        <FormControlLabelText>País*</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="country"
                        render={({ field: { onChange, value } }) => (
                            <Input borderColor={muted}>
                                <InputField placeholder="Ex: França" value={value} onChangeText={onChange} />
                            </Input>
                        )}
                    />
                    {errors.country && <Text color="$error500">{errors.country.message}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.grape}>
                    <FormControlLabel>
                        <FormControlLabelText>Variação da Uva*</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="grape"
                        render={({ field: { onChange, value } }) => (
                            <Input borderColor={muted}>
                                <InputField placeholder="Ex: Merlot" value={value} onChangeText={onChange} />
                            </Input>
                        )}
                    />
                    {errors.grape && <Text color="$error500">{errors.grape.message}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.closure}>
                    <FormControlLabel>
                        <FormControlLabelText>Vedação*</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="closure"
                        render={({ field: { onChange, value } }) => (
                            <Input borderColor={muted}>
                                <InputField placeholder="Ex: Rolha de cortiça" value={value} onChangeText={onChange} />
                            </Input>
                        )}
                    />
                    {errors.closure && <Text color="$error500">{errors.closure.message}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.type}>
                    <FormControlLabel>
                        <FormControlLabelText>Tipo de Vinho*</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="type"
                        render={({ field: { onChange, value } }) => (
                            <Input borderColor={muted}>
                                <InputField placeholder="Ex: Tinto seco" value={value} onChangeText={onChange} />
                            </Input>
                        )}
                    />
                    {errors.type && <Text color="$error500">{errors.type.message}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.image}>
                    <FormControlLabel>
                        <FormControlLabelText>Imagem (opcional)</FormControlLabelText>
                    </FormControlLabel>
                    <HStack space="md" mt="$2">
                        <Button variant="solid" bgColor={primary} onPress={handlePickImageFromCamera} isDisabled={isUploading}>
                            <ButtonText color="white">Câmera</ButtonText>
                        </Button>
                        <Button variant="outline" borderColor={primary} onPress={handlePickImageFromGallery} isDisabled={isUploading}>
                            <ButtonText color={primary}>Galeria</ButtonText>
                        </Button>
                    </HStack>
                    {selectedImage && (
                        <Box mt="$4" alignItems="center">
                            <Image source={{ uri: selectedImage }} style={{ width: 160, height: 160, borderRadius: 8 }} resizeMode="cover" />
                        </Box>
                    )}
                </FormControl>

                <Button mt="$4" backgroundColor={primary} onPress={handleSubmit(onSubmit)}>
                    <ButtonText>Salvar Vinho</ButtonText>
                </Button>
            </VStack>
        </Box>
    );
}
