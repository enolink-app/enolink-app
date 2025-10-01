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
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { uploadBytes, ref, getDownloadURL, getStorage, uploadBytesResumable } from "firebase/storage";
import { Progress, ProgressFilledTrack } from "@gluestack-ui/themed";
import { Platform } from "react-native";
import { uploadEventImage } from "@/services/storage";
import { uploadImage } from "@/services/storage";
import useLanguageStore from "@/stores/useLanguageStore";

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

const LANGUAGES = [
    { name: "Português (Brasil)", code: "pt-BR", flag: "🇧🇷" },
    { name: "Português (Portugal)", code: "pt-PT", flag: "🇵🇹" },
    { name: "English", code: "en", flag: "🇺🇸" },
    { name: "Español", code: "es-ES", flag: "🇪🇸" },
    { name: "Italiano", code: "it-IT", flag: "🇮🇹" },
    { name: "Français", code: "fr-FR", flag: "🇫🇷" },
];

const getLanguageByCode = (code: string) => {
    return LANGUAGES.find((lang) => lang.code === code) || LANGUAGES[0];
};

export default function EditProfileScreen() {
    const [avatar, setAvatar] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(userData?.language ? getLanguageByCode(userData.language) : LANGUAGES[0]);
    const router = useRouter();
    const storage = getStorage();
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];
    const textLight = config.tokens.colors.textLight;
    const user = auth.currentUser;
    const toast = useToast();
    const { t, language, setLanguage } = useLanguageStore();
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    setCurrentUser(user);

                    const userDocRef = doc(db, "users", user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userDataFromFirestore = userDoc.data();
                        setUserData(userDataFromFirestore);

                        const userLanguage = userDataFromFirestore.language || "pt-BR";
                        const languageItem = getLanguageByCode(userLanguage);
                        setSelectedLanguage(languageItem);

                        reset({
                            name: userDataFromFirestore.displayName || user.displayName || "",
                            language: userLanguage,
                        });

                        if (userDataFromFirestore.photoURL) {
                            setAvatar(userDataFromFirestore.photoURL);
                        } else if (user.photoURL) {
                            setAvatar(user.photoURL);
                        }
                    } else {
                        reset({
                            name: user.displayName || "",
                            language: "pt-BR",
                        });

                        if (user.photoURL) {
                            setAvatar(user.photoURL);
                        }
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar dados do usuário:", error);
            }
        };

        loadUserData();
    }, []);

    const handleChangeAvatar = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permissão necessária", "Precisamos acessar sua galeria para alterar a foto");
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets.length > 0) {
                setAvatar(result.assets[0].uri);
                setShowDialog(false);
            }
        } catch (error) {
            console.error("Erro ao selecionar imagem:", error);
            Alert.alert("Erro", error);
        }
    };

    const uploadAvatar = async (uri: string): Promise<string> => {
        const user = auth.currentUser;
        if (!user) throw new Error("Usuário não autenticado");

        try {
            if (!uri) throw new Error("URI da imagem não fornecida");

            const timestamp = Date.now();
            const path = `avatars/${user.uid}_${timestamp}.jpg`;

            const downloadURL = await uploadImage(uri, path);

            return downloadURL;
        } catch (error) {
            console.error("Erro no processo de upload:", error);
            throw error;
        }
    };

    const reloadUserProfile = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                await user.reload();
                setCurrentUser({ ...user });
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

            const updates: {
                displayName?: string;
                photoURL?: string;
            } = {};

            let newPhotoURL = null;
            if (avatar && avatar !== user.photoURL) {
                try {
                    newPhotoURL = await uploadAvatar(avatar);
                    updates.photoURL = newPhotoURL;
                } catch (error) {
                    console.error("Erro ao fazer upload do avatar:", error);
                    throw new Error(t("general.errorDefault"));
                }
            }

            if (data.name !== user?.displayName) {
                updates.displayName = data.name;
            }

            if (Object.keys(updates).length > 0) {
                await updateProfile(user, updates);
            }

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

            await reloadUserProfile();

            if (data.language !== useLanguageStore.getState().language) {
                await useLanguageStore.getState().setLanguage(data.language);
            }

            toast.show({
                placement: "top",
                render: () => (
                    <Box bg="$success500" p="$3" rounded="$md">
                        <Text color="$textDark">{t("general.successDefault")}</Text>
                    </Box>
                ),
            });

            setCurrentUser({
                ...user,
                displayName: data.name,
                photoURL: newPhotoURL || user.photoURL,
            });

            setUserData(userData);

            setTimeout(() => router.back(), 1000);
        } catch (error: any) {
            console.error("Erro detalhado:", {
                code: error.code,
                message: error.message,
                serverResponse: error.customData?.serverResponse,
                fullError: error,
            });

            let errorMessage = t("general.errorDefault");
            if (error.code === "storage/unknown") {
                errorMessage = t("general.errorDefault");
            } else if (error.message) {
                errorMessage = error.message;
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

            await updateProfile(user, { photoURL: null });

            await setDoc(
                doc(db, "users", user.uid),
                {
                    photoURL: null,
                    updatedAt: new Date().toISOString(),
                },
                { merge: true }
            );

            setAvatar(null);
            setCurrentUser({ ...user, photoURL: null });

            toast.show({
                placement: "top",
                render: () => (
                    <Box bg="$success500" p="$3" rounded="$md">
                        <Text color="$textDark">{t("general.successDefault")}</Text>
                    </Box>
                ),
            });
        } catch (error) {
            console.error("Erro ao remover avatar:", error);
            toast.show({
                placement: "top",
                render: () => (
                    <Box bg="$error500" p="$3" rounded="$md">
                        <Text color="$textDark">{t("general.errorDefault")}</Text>
                    </Box>
                ),
            });
        } finally {
            setLoading(false);
            setShowDialog(false);
        }
    };

    const password = watch("password");
    const isEmailUser = currentUser?.providerData?.some((provider) => provider.providerId === "password");

    return (
        <Box flex={1} bg="$backgroundLight" p="$4" pt={50}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                <HStack justifyContent="space-between" alignItems="center">
                    <ChevronLeft onPress={() => router.push("/tabs/(tabs)/profile")} key="half" size={30} style={{ marginRight: 6 }} color={config.tokens.colors.textLight} />

                    <Heading size="lg">{t("forms.editProfile.title")}</Heading>
                </HStack>
            </Box>

            <VStack space="lg">
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
                        <AvatarImage borderColor={primary} borderWidth={0.5} source={avatar ? { uri: avatar } : require("../../assets/images/placeholder.png")} alt="User avatar" />
                    </Avatar>
                </TouchableOpacity>

                <AlertDialog isOpen={showDialog} onClose={() => setShowDialog(false)}>
                    <AlertDialogBackdrop />
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <Text>{t("forms.addWineDiary.image")}</Text>
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            <Button variant="outline" onPress={handleChangeAvatar} mb="$2">
                                <ButtonText>{t("forms.addWineDiary.gallery")}</ButtonText>
                            </Button>
                            {currentUser?.photoURL && (
                                <Button variant="outline" bg="$red100" borderColor="$red500" onPress={handleRemoveAvatar}>
                                    <ButtonText color="$red500">{t("forms.editProfile.remove")}</ButtonText>
                                </Button>
                            )}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button action="secondary" onPress={() => setShowDialog(false)}>
                                <ButtonText>{t("forms.editProfile.cancel")}</ButtonText>
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <FormControl isInvalid={!!errors.name}>
                    <FormControlLabel>
                        <FormControlLabelText>{t("forms.editProfile.name")}</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <Input>
                                <InputField bg="#FFFFFF" placeholder={t("forms.editProfile.name")} value={value} onChangeText={onChange} />
                            </Input>
                        )}
                    />
                    {errors.name && <Text color="$error500">{errors?.name?.message}</Text>}
                </FormControl>

                {isEmailUser && (
                    <>
                        {!showPasswordFields ? (
                            <Button variant="outline" onPress={() => setShowPasswordFields(true)}>
                                <ButtonText>{t("forms.editProfile.alterPassword")}</ButtonText>
                            </Button>
                        ) : (
                            <>
                                <FormControl isInvalid={!!errors.currentPassword}>
                                    <FormControlLabel>
                                        <FormControlLabelText>{t("forms.editProfile.currentPassword")}</FormControlLabelText>
                                    </FormControlLabel>
                                    <Controller
                                        control={control}
                                        name="currentPassword"
                                        render={({ field: { onChange, value } }) => (
                                            <Input>
                                                <InputField
                                                    bg="#FFFFFF"
                                                    placeholder={t("forms.editProfile.currentPassword")}
                                                    secureTextEntry
                                                    value={value}
                                                    onChangeText={onChange}
                                                />
                                            </Input>
                                        )}
                                    />
                                    {errors.currentPassword && <Text color="$error500">{errors.currentPassword.message}</Text>}
                                </FormControl>

                                <FormControl isInvalid={!!errors.password}>
                                    <FormControlLabel>
                                        <FormControlLabelText>{t("forms.editProfile.newPassword")}</FormControlLabelText>
                                    </FormControlLabel>
                                    <Controller
                                        control={control}
                                        name="password"
                                        render={({ field: { onChange, value } }) => (
                                            <Input>
                                                <InputField bg="#FFFFFF" placeholder={t("forms.editProfile.newPassword")} secureTextEntry value={value} onChangeText={onChange} />
                                            </Input>
                                        )}
                                    />
                                    {errors.password && <Text color="$error500">{errors.password.message}</Text>}
                                </FormControl>

                                {password && (
                                    <Button variant="link" onPress={() => setShowPasswordFields(false)}>
                                        <ButtonText>{t("forms.editProfile.cancel")}</ButtonText>
                                    </Button>
                                )}
                            </>
                        )}
                    </>
                )}

                <FormControl isInvalid={!!errors.language}>
                    <FormControlLabel>
                        <FormControlLabelText>{t("forms.editProfile.language")}</FormControlLabelText>
                    </FormControlLabel>
                    <Controller
                        control={control}
                        name="language"
                        render={({ field: { onChange, value } }) => (
                            <Select
                                selectedValue={selectedLanguage.code}
                                onValueChange={(selectedCode) => {
                                    const selected = LANGUAGES.find((lang) => lang.code === selectedCode) || LANGUAGES[0];
                                    setSelectedLanguage(selected);
                                    onChange(selectedCode); // Armazena apenas o código no formulário
                                }}
                            >
                                <SelectTrigger>
                                    <SelectInput bg="#FFFFFF" placeholder="Selecione um idioma" value={`${selectedLanguage.flag} ${selectedLanguage.name}`} />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        {LANGUAGES.map((lang) => (
                                            <SelectItem key={lang.code} label={`${lang.flag} ${lang.name}`} value={lang.code}>
                                                <HStack alignItems="center" space="sm">
                                                    <Text fontSize="$lg">{lang.flag}</Text>
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

                <HStack space="md" mt="$4" justifyContent="center">
                    <Button variant="outline" borderColor={neutralDark} action="secondary" onPress={() => router.back()} isDisabled={loading}>
                        <ButtonText color={neutralDark}>{t("forms.editProfile.cancel")}</ButtonText>
                    </Button>
                    <Button bg={neutralDark} onPress={handleSubmit(onSubmit)} isDisabled={loading}>
                        <ButtonText>{loading ? t("general.loading") : t("forms.editProfile.submit")}</ButtonText>
                    </Button>
                </HStack>
            </VStack>
        </Box>
    );
}
