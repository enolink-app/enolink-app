// src/screens/Diary/AddWineFullScreen.tsx
import { Box, Heading, VStack, FormControl, FormControlLabel, FormControlLabelText, Input, InputField, Button, ButtonText, Text, HStack } from "@gluestack-ui/themed";
import { useForm, Controller } from "react-hook-form";
import { Image, Alert } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { config } from "@/gluestack-ui.config";

const wineSchema = yup.object({
    name: yup.string().required("Nome é obrigatório"),
    harvest: yup
        .string()
        .matches(/^\d{4}$/, "Informe o ano com 4 dígitos")
        .required("Safra é obrigatória"),
    country: yup.string().required("País é obrigatório"),
    grape: yup.string().required("Variação da uva é obrigatória"),
    region: yup.string().required("Região é obrigatória"),
    denomination: yup.string().required("Denominação é obrigatória"),
    abv: yup.string().required("ABV é obrigatório"),
    producer: yup.string().required("Produtor é obrigatório"),
    closure: yup.string().required("Vedação é obrigatória"),
    type: yup.string().required("Tipo de vinho é obrigatório"),
    image: yup.string().notRequired(),
});

type WineFormData = yup.InferType<typeof wineSchema>;

export default function AddWineFullScreen() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const primary = config.tokens.colors.primary["500"];
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<WineFormData>({
        resolver: yupResolver(wineSchema),
    });

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

    const onSubmit = (data: WineFormData) => {
        const fullData = {
            ...data,
            image: selectedImage,
        };
        Alert.alert("✅ Vinho salvo!", JSON.stringify(fullData, null, 2));
    };

    return (
        <Box flex={1} bg="$backgroundLight" p="$4">
            <Heading size="lg" mb="$4">
                Adicionar Vinho
            </Heading>

            <VStack space="md">
                {/* Campos do formulário */}
                {[
                    { name: "name", label: "Nome" },
                    { name: "harvest", label: "Safra (Ano)", keyboardType: "numeric" },
                    { name: "country", label: "País" },
                    { name: "grape", label: "Variação da Uva" },
                    { name: "region", label: "Região" },
                    { name: "denomination", label: "Denominação" },
                    { name: "abv", label: "ABV (%)", keyboardType: "numeric" },
                    { name: "producer", label: "Produtor" },
                    { name: "closure", label: "Vedação" },
                    { name: "type", label: "Tipo de Vinho" },
                ].map((field) => (
                    <FormControl key={field.name} isInvalid={!!errors[field.name as keyof WineFormData]}>
                        <FormControlLabel>
                            <FormControlLabelText>{field.label}*</FormControlLabelText>
                        </FormControlLabel>
                        <Controller
                            control={control}
                            name={field.name as keyof WineFormData}
                            render={({ field: { onChange, value } }) => (
                                <Input>
                                    <InputField placeholder={field.label} value={value} onChangeText={onChange} keyboardType={field.keyboardType as any} />
                                </Input>
                            )}
                        />
                        {errors[field.name as keyof WineFormData] && <Text color="$error500">{errors[field.name as keyof WineFormData]?.message}</Text>}
                    </FormControl>
                ))}

                {/* Imagem */}
                <FormControl>
                    <FormControlLabel>
                        <FormControlLabelText>Imagem (opcional)</FormControlLabelText>
                    </FormControlLabel>

                    <HStack space="md" mt="$2">
                        <Button variant="solid" bgColor={primary} onPress={() => handlePickImage(true)}>
                            <ButtonText>Câmera</ButtonText>
                        </Button>
                        <Button variant="outline" borderColor={primary} onPress={() => handlePickImage(false)}>
                            <ButtonText>Galeria</ButtonText>
                        </Button>
                    </HStack>

                    {selectedImage && (
                        <Box mt="$4" alignItems="center">
                            <Image source={{ uri: selectedImage }} style={{ width: 160, height: 160, borderRadius: 8 }} />
                        </Box>
                    )}
                </FormControl>

                {/* Botão de envio */}
                <Button mt="$4" bg="$primary500" onPress={handleSubmit(onSubmit)}>
                    <ButtonText>Salvar Vinho</ButtonText>
                </Button>
            </VStack>
        </Box>
    );
}
