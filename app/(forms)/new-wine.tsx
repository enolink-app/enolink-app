import { useState } from "react";
import { Box, Heading, VStack, HStack, FormControl, FormControlLabel, FormControlLabelText, Input, InputField, Button, ButtonText, Text } from "@gluestack-ui/themed";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert } from "react-native";
import { config } from "@/gluestack-ui.config";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { useNavigation } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useRequest } from "@/hooks/useRequest";
import { useWineStore } from "@/stores/useWineStores";
import { useRouter } from "expo-router";
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
    const primary = config.tokens.colors.primary?.["500"];
    const neutralLight = config.tokens.colors.muted;
    const textDark = config.tokens.colors.textDark;
    const textLight = config.tokens.colors.textLight;
    const route = useRouter();
    const { createWine } = useRequest();
    const navigation = useNavigation();
    const addWineToStore = useWineStore((state) => state.addWine);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    } = useForm<WineFormData>({
        resolver: yupResolver(wineSchema),
        defaultValues: {
            name: "",
            harvest: "",
            country: "",
            grape: "",
            closure: "",
            type: "",
            image: null,
        },
    });

    const onSubmit = async (data: WineFormData) => {
        const fullData = {
            ...data,
            image: selectedImage,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const createdWine: Wine = await createWine(fullData);

        addWineToStore(createdWine);
        Alert.alert("Vinho cadastrado!", JSON.stringify(fullData, null, 2));
    };

    return (
        <Box flex={1} bg="$backgroundLight" p="$4" mt={50}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                <HStack justifyContent="space-between" alignItems="center">
                    <ChevronLeft color={textLight} size={40} onPress={() => route.back()} />
                    <Heading size="lg">Adicionar Vinho</Heading>
                </HStack>
            </Box>

            <VStack space="md">
                <FormControl isInvalid={!!errors.name}>
                    <FormControlLabel>
                        <FormControlLabelText>Nome*</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <Input>
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
                            <Input>
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
                            <Input>
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
                            <Input>
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
                            <Input>
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
                            <Input>
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
                        <Button variant="solid" bgColor={primary} onPress={handlePickImageFromCamera}>
                            <ButtonText>Câmera</ButtonText>
                        </Button>
                        <Button variant="outline" borderColor={primary} onPress={handlePickImageFromGallery}>
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
