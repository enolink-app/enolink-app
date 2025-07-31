import {
    Box,
    Heading,
    VStack,
    Avatar,
    AvatarImage,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Input,
    InputField,
    Select,
    SelectTrigger,
    SelectInput,
    SelectPortal,
    SelectItem,
    SelectBackdrop,
    SelectContent,
    Button,
    ButtonText,
    HStack,
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogBody,
    AlertDialogHeader,
    AlertDialogCloseButton,
    Text,
    useToast,
} from "@gluestack-ui/themed";
import { Alert, Image, TouchableOpacity } from "react-native";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { config } from "@/gluestack-ui.config";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { auth, db } from "@/lib/firebase";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { uploadBytes, ref, getDownloadURL, getStorage, uploadBytesResumable } from "firebase/storage";
import { Progress, ProgressFilledTrack } from "@gluestack-ui/themed";

// Schema de validação
const schema = yup.object({
    name: yup.string().required("Nome é obrigatório"),
    currentPassword: yup.string().when("password", {
        is: (val: string) => val && val.length > 0,
        then: yup.string().required("Senha atual é obrigatória para alterar a senha"),
    }),
    password: yup
        .string()
        .min(6, "Mínimo 6 caracteres")
        .test("password-required-for-email", "Senha é obrigatória para usuários com autenticação por email", function (value) {
            const user = auth.currentUser;
            if (user?.providerData.some((provider) => provider.providerId === "password")) {
                return !!value || !this.parent.currentPassword;
            }
            return true;
        }),
    language: yup.string().required("Idioma é obrigatório"),
});

type FormData = yup.InferType<typeof schema>;

// Lista de idiomas com bandeiras
const LANGUAGES = [
    { code: "pt", name: "Português", flag: require("../../assets/images/br.png") },
    { code: "en", name: "English", flag: require("../../assets/images/us.png") },
    { code: "es", name: "Español", flag: require("../../assets/images/es.png") },
];

export default function EditProfileScreen() {
    const [avatar, setAvatar] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const router = useRouter();
    const storage = getStorage();
    const primary = config.tokens.colors.primary["500"];
    const textLight = config.tokens.colors.textLight;

    const toast = useToast();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    // Carrega os dados do usuário ao montar o componente
    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setCurrentUser(user);
            if (user.photoURL) {
                setAvatar(user.photoURL);
            }
            reset({
                name: user.displayName || "",
                language: "pt", // Valor padrão
            });
        }
    }, []);

    const handleChangeAvatar = async () => {
        try {
            // Verifica permissões
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permissão necessária", "Precisamos acessar sua galeria para alterar a foto");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
                allowsMultipleSelection: false,
            });

            if (!result.canceled && result.assets[0]) {
                setAvatar(result.assets[0].uri);
                setShowDialog(false); // Fecha o diálogo após seleção
            }
        } catch (error) {
            console.error("Erro ao selecionar imagem:", error);
            Alert.alert("Erro", "Não foi possível selecionar a imagem");
        }
    };

    const uploadAvatar = async (uri: string): Promise<string> => {
        const user = auth.currentUser;
        if (!user) throw new Error("Usuário não autenticado");

        try {
            const timestamp = Date.now();
            const storageRef = ref(storage, `avatars/${user.uid}_${timestamp}.jpg`);

            const response = await fetch(uri);
            if (!response.ok) throw new Error("Falha ao carregar imagem");

            const blob = await response.blob();

            // Usando uploadBytesResumable corretamente
            const uploadTask = uploadBytesResumable(storageRef, blob);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(progress);
                    },
                    (error) => {
                        setUploadProgress(0);
                        reject(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            setUploadProgress(0);
                            resolve(downloadURL);
                        } catch (error) {
                            setUploadProgress(0);
                            reject(error);
                        }
                    }
                );
            });
        } catch (error) {
            setUploadProgress(0);
            throw error;
        }
    };

    const reloadUserProfile = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                await user.reload();
                setCurrentUser({ ...user }); // Força a atualização do estado
            }
        } catch (error) {
            console.error("Erro ao recarregar perfil:", error);
        }
    };

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);
            const user = auth.currentUser;

            if (!user) {
                throw new Error("Usuário não autenticado");
            }

            // Objeto para armazenar todas as atualizações
            const updates: {
                displayName?: string;
                photoURL?: string;
            } = {};

            // 1. Upload da foto se necessário
            let newPhotoURL = null;
            if (avatar && avatar !== user.photoURL) {
                try {
                    newPhotoURL = await uploadAvatar(avatar);
                    updates.photoURL = newPhotoURL;
                } catch (error) {
                    console.error("Erro ao fazer upload do avatar:", error);
                    throw new Error("Falha ao atualizar a foto de perfil");
                }
            }

            // 2. Atualizar nome se modificado
            if (data.name !== user.displayName) {
                updates.displayName = data.name;
            }

            // 3. Aplicar atualizações no perfil do Firebase Auth
            if (Object.keys(updates).length > 0) {
                await updateProfile(user, updates);
            }

            // 4. Atualizar senha se fornecida
            if (data.password && data.currentPassword && user.email) {
                try {
                    const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
                    await reauthenticateWithCredential(user, credential);
                    await updatePassword(user, data.password);
                } catch (error: any) {
                    if (error.code === "auth/wrong-password") {
                        throw new Error("Senha atual incorreta");
                    }
                    throw error;
                }
            }

            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: data.name,
                language: data.language,
                photoURL: newPhotoURL || user.photoURL || null,
                updatedAt: new Date().toISOString(),
            };

            await setDoc(doc(db, "users", user.uid), userData, { merge: true });

            // Força a atualização do perfil
            await reloadUserProfile();

            // Feedback visual
            toast.show({
                placement: "top",
                render: () => (
                    <Box bg="$success500" p="$3" rounded="$md">
                        <Text color="$textDark">Perfil atualizado com sucesso!</Text>
                    </Box>
                ),
            });

            // Atualiza o estado local com os novos dados
            setCurrentUser({
                ...user,
                displayName: data.name,
                photoURL: newPhotoURL || user.photoURL,
            });

            // Volta para tela anterior após 1 segundo
            setTimeout(() => router.back(), 1000);
        } catch (error: any) {
            console.error("Erro detalhado:", error);

            let errorMessage = "Erro ao atualizar perfil";
            if (error.message) {
                errorMessage = error.message;
            } else if (error.code) {
                switch (error.code) {
                    case "auth/wrong-password":
                        errorMessage = "Senha atual incorreta";
                        break;
                    case "auth/requires-recent-login":
                        errorMessage = "Faça login novamente para alterar a senha";
                        break;
                    case "permission-denied":
                        errorMessage = "Sem permissão para atualizar";
                        break;
                    default:
                        errorMessage = `Erro: ${error.code}`;
                }
            }

            toast.show({
                placement: "top",
                render: () => (
                    <Box bg="$error500" p="$3" rounded="$md">
                        <Text color="$textDark">{errorMessage}</Text>
                    </Box>
                ),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            setLoading(true);
            const user = auth.currentUser;
            if (!user) return;

            // Remove a foto do perfil
            await updateProfile(user, { photoURL: null });

            // Atualiza no Firestore
            await setDoc(
                doc(db, "users", user.uid),
                {
                    photoURL: null,
                    updatedAt: new Date().toISOString(),
                },
                { merge: true }
            );

            // Atualiza estado local
            setAvatar(null);
            setCurrentUser({ ...user, photoURL: null });

            toast.show({
                placement: "top",
                render: () => (
                    <Box bg="$success500" p="$3" rounded="$md">
                        <Text color="$textDark">Foto removida com sucesso!</Text>
                    </Box>
                ),
            });
        } catch (error) {
            console.error("Erro ao remover avatar:", error);
            toast.show({
                placement: "top",
                render: () => (
                    <Box bg="$error500" p="$3" rounded="$md">
                        <Text color="$textDark">Erro ao remover foto</Text>
                    </Box>
                ),
            });
        } finally {
            setLoading(false);
            setShowDialog(false);
        }
    };
    const password = watch("password");
    const isEmailUser = currentUser?.providerData.some((provider) => provider.providerId === "password");

    return (
        <Box flex={1} bg="$backgroundLight" p="$4" pt={50}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                <HStack justifyContent="space-between" alignItems="center">
                    <ChevronLeft color={textLight} size={40} onPress={() => router.back()} />
                    <Heading size="lg">Editar Perfil</Heading>
                </HStack>
            </Box>

            <VStack space="lg">
                {/* Seção do Avatar */}
                <TouchableOpacity onPress={() => setShowDialog(true)}>
                    <Avatar size="xl" borderRadius="$full" alignSelf="center">
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <Box position="absolute" width="$full" bottom={0} px="$2">
                                <Progress value={uploadProgress}>
                                    <ProgressFilledTrack />
                                </Progress>
                                <Text size="xs" textAlign="center" color="$white">
                                    {Math.round(uploadProgress)}%
                                </Text>
                            </Box>
                        )}
                        <AvatarImage source={{ uri: avatar || DEFAULT_AVATAR }} alt="User avatar" />
                    </Avatar>
                </TouchableOpacity>

                <AlertDialog isOpen={showDialog} onClose={() => setShowDialog(false)}>
                    <AlertDialogBackdrop />
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <Text>Foto de Perfil</Text>
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            <Button variant="outline" onPress={handleChangeAvatar} mb="$2">
                                <ButtonText>Escolher da Galeria</ButtonText>
                            </Button>
                            {currentUser?.photoURL && (
                                <Button variant="outline" bg="$red100" borderColor="$red500" onPress={handleRemoveAvatar}>
                                    <ButtonText color="$red500">Remover Foto</ButtonText>
                                </Button>
                            )}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button action="secondary" onPress={() => setShowDialog(false)}>
                                <ButtonText>Fechar</ButtonText>
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Campo Nome */}
                <FormControl isInvalid={!!errors.name}>
                    <FormControlLabel>
                        <FormControlLabelText>Nome</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <Input>
                                <InputField placeholder="Seu nome" value={value} onChangeText={onChange} />
                            </Input>
                        )}
                    />
                    {errors.name && <Text color="$error500">{errors.name.message}</Text>}
                </FormControl>

                {/* Seção de Senha (apenas para usuários de email/senha) */}
                {isEmailUser && (
                    <>
                        {!showPasswordFields ? (
                            <Button variant="outline" onPress={() => setShowPasswordFields(true)}>
                                <ButtonText>Alterar Senha</ButtonText>
                            </Button>
                        ) : (
                            <>
                                <FormControl isInvalid={!!errors.currentPassword}>
                                    <FormControlLabel>
                                        <FormControlLabelText>Senha Atual</FormControlLabelText>
                                    </FormControlLabel>
                                    <Controller
                                        control={control}
                                        name="currentPassword"
                                        render={({ field: { onChange, value } }) => (
                                            <Input>
                                                <InputField placeholder="Digite sua senha atual" secureTextEntry value={value} onChangeText={onChange} />
                                            </Input>
                                        )}
                                    />
                                    {errors.currentPassword && <Text color="$error500">{errors.currentPassword.message}</Text>}
                                </FormControl>

                                <FormControl isInvalid={!!errors.password}>
                                    <FormControlLabel>
                                        <FormControlLabelText>Nova Senha</FormControlLabelText>
                                    </FormControlLabel>
                                    <Controller
                                        control={control}
                                        name="password"
                                        render={({ field: { onChange, value } }) => (
                                            <Input>
                                                <InputField placeholder="Digite sua nova senha" secureTextEntry value={value} onChangeText={onChange} />
                                            </Input>
                                        )}
                                    />
                                    {errors.password && <Text color="$error500">{errors.password.message}</Text>}
                                </FormControl>

                                {password && (
                                    <Button variant="link" onPress={() => setShowPasswordFields(false)}>
                                        <ButtonText>Cancelar alteração de senha</ButtonText>
                                    </Button>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* Campo Idioma com Bandeiras */}
                <FormControl isInvalid={!!errors.language}>
                    <FormControlLabel>
                        <FormControlLabelText>Idioma</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="language"
                        render={({ field: { onChange, value } }) => (
                            <Select selectedValue={value} onValueChange={onChange}>
                                <SelectTrigger>
                                    <SelectInput placeholder="Selecione um idioma" />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        {LANGUAGES.map((lang) => (
                                            <SelectItem
                                                key={lang.code}
                                                label={lang.name}
                                                value={lang.code}
                                                startIcon={<Image source={lang.flag} alt={lang.name} width={24} height={16} mr="$2" />}
                                            >
                                                <HStack alignItems="center" justifyContent="space-between" space="sm">
                                                    <Image source={lang.flag} alt={lang.name} width={24} height={16} mr="$2" />
                                                    <Text>{lang.name}</Text>
                                                </HStack>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        )}
                    />
                    {errors.language && <Text color="$error500">{errors.language.message}</Text>}
                </FormControl>

                {/* Botões de ação */}
                <HStack space="md" mt="$4" justifyContent="center">
                    <Button variant="outline" action="secondary" onPress={() => router.back()} isDisabled={loading}>
                        <ButtonText>Cancelar</ButtonText>
                    </Button>
                    <Button bg="$primary500" onPress={handleSubmit(onSubmit)} isDisabled={loading}>
                        <ButtonText>{loading ? "Salvando..." : "Salvar Alterações"}</ButtonText>
                    </Button>
                </HStack>
            </VStack>
        </Box>
    );
}
