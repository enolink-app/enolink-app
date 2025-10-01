import { Box, FlatList, Heading, ButtonIcon, Button, HStack, VStack, Text, ButtonText, Image, StarIcon, Input, InputField, Textarea, TextareaInput } from "@gluestack-ui/themed";
import { Plus, ChevronLeft } from "lucide-react-native";
import { Platform, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import { DiaryCard } from "@/components/DiaryCard";
import { config } from "@/gluestack-ui.config";
import { useNavigation } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import { useRequest } from "@/hooks/useRequest";
import { auth } from "@/lib/firebase";
import useLanguageStore from "@/stores/useLanguageStore";
import EventSearchBar from "@/components/EventSearchBar";
import { checkDiaryFirstLaunch } from "@/utils/firstLaunch";
import DiaryOnboarding from "@/components/DiaryOnboarding";

export default function DiaryScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { getDiaryEntries, updateDiaryEntry } = useRequest();
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [updateKey, setUpdateKey] = useState(0);
    const [showDiaryOnboarding, setShowDiaryOnboarding] = useState(false);
    const { t, forceUpdate } = useLanguageStore();
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];
    const textDark = config.tokens.colors.textDark;
    const textLight = config.tokens.colors.textLight;

    useEffect(() => {
        const checkDiaryOnboarding = async () => {
            const isFirstTime = await checkDiaryFirstLaunch();
            if (isFirstTime) {
                setShowDiaryOnboarding(true);
            }
        };

        checkDiaryOnboarding();
    }, []);

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const data = await getDiaryEntries();
            setEntries(data || []);
        } catch (error) {
            console.error("Error fetching diary entries:", error);
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const handleEntryPress = (entry: any) => {
        setSelectedEntry(entry);
        setEditNotes(entry.notes || "");
        setEditColor(entry.color ?? 0);
        setEditAroma(entry.aroma ?? 0);
        setEditFlavor(entry.flavor ?? 0);
        setEditMode(false);
        setModalVisible(true);
    };

    const renderStars = (rating: number, size: string = "md") => {
        return (
            <Box flexDirection="row">
                {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} size={size} fill={i < Math.floor(rating) ? "$yellow500" : "$muted"} color={i < Math.floor(rating) ? "$yellow500" : "$muted"} mr="$1" />
                ))}
            </Box>
        );
    };

    const [query, setQuery] = useState("");

    const filteredEntries = useMemo(() => {
        const q = (query || "").trim().toLowerCase();
        if (!q) return entries;

        return entries.filter((entry: any) => {
            const name = (entry?.wineData?.name || "").toString().toLowerCase();
            const notes = (entry?.notes || "").toString().toLowerCase();
            const grape = (entry?.wineData?.grape || entry?.wineData?.variety || "").toString().toLowerCase();
            const country = (entry?.wineData?.country || "").toString().toLowerCase();
            const dateStr = entry?.createdAt ? new Date(entry.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).toLowerCase() : "";

            return name.includes(q) || notes.includes(q) || grape.includes(q) || country.includes(q) || dateStr.includes(q);
        });
    }, [entries, query]);

    const [editMode, setEditMode] = useState(false);
    const [editNotes, setEditNotes] = useState("");
    const [editColor, setEditColor] = useState<number | string>(0);
    const [editAroma, setEditAroma] = useState<number | string>(0);
    const [editFlavor, setEditFlavor] = useState<number | string>(0);
    const [savingEdit, setSavingEdit] = useState(false);

    const handleStartEdit = () => {
        setEditMode(true);
    };

    const validateRating = (value: any) => {
        const n = Number(value);
        return !isNaN(n) && n >= 0 && n <= 5;
    };

    const handleSaveEdit = async () => {
        if (!selectedEntry) return;

        if (!validateRating(editColor) || !validateRating(editAroma) || !validateRating(editFlavor)) {
            Alert.alert(`${t("general.error")}`, "As notas devem ser números entre 0 e 5.");
            return;
        }

        setSavingEdit(true);
        try {
            const payload = {
                color: Number(editColor),
                aroma: Number(editAroma),
                flavor: Number(editFlavor),
                notes: editNotes,
            };

            const updated = await updateDiaryEntry(selectedEntry.id, payload);

            await fetchEntries();

            setModalVisible(false);
            Alert.alert(`${t("general.success")}`, `${t("diary.successUpdateNote")}`);
        } catch (error: any) {
            console.error(`${t("general.error")}`, error);
            Alert.alert(`${t("general.error")}`, error?.response?.data?.error);
        } finally {
            setSavingEdit(false);
            setEditMode(false);
        }
    };

    return (
        <Box key={updateKey} flex={1} bg="$backgroundLight" p="$4" mt={Platform.OS == "ios" ? 50 : 0}>
            <DiaryOnboarding visible={showDiaryOnboarding} onClose={() => setShowDiaryOnboarding(false)} />
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                <HStack alignItems="center" space="md">
                    <ChevronLeft key="half" size={30} style={{ marginRight: 6 }} color={neutralDark} onPress={() => router.push("/tabs/(tabs)/home")} />
                    <Heading color={primary} size="lg">
                        {t("diary.title")}
                    </Heading>
                </HStack>
            </Box>

            <EventSearchBar value={query} onChange={setQuery} placeholder={t("diary.searchPlaceholder") ?? "Buscar avaliações..."} />

            {loading ? (
                <Text>{t("general.loading")}</Text>
            ) : filteredEntries.length === 0 ? (
                <VStack flex={1} justifyContent="center" alignItems="center">
                    <Text color="$muted" mb="$4">
                        {query ? `${t("diary.notFound")} "${query}"` : t("general.noItems")}
                    </Text>
                    {!query && (
                        <Button bgColor={primary} onPress={() => router.push("/(forms)/new-diary-wine-list")}>
                            <ButtonText>{t("diary.addFirst")}</ButtonText>
                        </Button>
                    )}
                </VStack>
            ) : (
                <FlatList
                    data={filteredEntries}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Box mx="$2">
                            <DiaryCard
                                id={item?.id}
                                image={item?.wineData?.image}
                                name={item?.wineData?.name}
                                type={item?.wineData?.type}
                                country={item?.wineData?.country}
                                rating={item?.average}
                                date={item?.createdAt}
                                onPress={() => handleEntryPress(item)}
                            />
                        </Box>
                    )}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <Box flex={1} justifyContent="center" alignItems="center" bg="rgba(0,0,0,0.5)">
                    <Box bg="$white" p="$6" borderRadius="$lg" w="90%" maxHeight="90%">
                        {selectedEntry && (
                            <>
                                <HStack space="md" alignItems="center" mb="$4">
                                    <Image source={{ uri: selectedEntry.wineData.image }} alt={selectedEntry.wineData.name} w={80} h={100} borderRadius="$md" resizeMode="cover" />
                                    <VStack flex={1}>
                                        <Heading color={neutralDark} size="md">
                                            {selectedEntry.wineData.name}
                                        </Heading>
                                        <Text color="$muted" fontSize="$sm">
                                            {selectedEntry.wineData.country}
                                            {selectedEntry.wineData.harvest && ` • ${selectedEntry.wineData.harvest}`}
                                            {selectedEntry.wineData.grape && ` • ${selectedEntry.wineData.grape}`}
                                        </Text>

                                        <HStack alignItems="center" mt="$2" space="sm">
                                            {renderStars(selectedEntry.average, "md")}
                                            <Text fontSize="$sm" color="$muted">
                                                {selectedEntry.average.toFixed(1)}
                                            </Text>
                                        </HStack>
                                    </VStack>
                                </HStack>

                                <VStack space="md" mb="$4">
                                    <Text color={neutralDark} fontWeight="$bold" fontSize="$lg">
                                        {t("diary.detailed")}
                                    </Text>

                                    <VStack space="xs">
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <Text color={neutralDark} fontWeight="$bold">
                                                {t("diary.color")}
                                            </Text>
                                            <Text color={neutralDark}>{editMode ? `${editColor}/5` : `${selectedEntry.color}/5`}</Text>
                                        </HStack>
                                        {editMode ? (
                                            <Input>
                                                <InputField
                                                    bg="#FFFFFF"
                                                    keyboardType="numeric"
                                                    value={String(editColor)}
                                                    onChangeText={(v) => setEditColor(v)}
                                                    placeholder="0 - 5"
                                                />
                                            </Input>
                                        ) : (
                                            renderStars(selectedEntry.color, "sm")
                                        )}
                                    </VStack>

                                    <VStack space="xs">
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <Text color={neutralDark} fontWeight="$bold">
                                                {t("diary.aroma")}
                                            </Text>
                                            <Text color={neutralDark}>{editMode ? `${editAroma}/5` : `${selectedEntry.aroma}/5`}</Text>
                                        </HStack>
                                        {editMode ? (
                                            <Input>
                                                <InputField
                                                    bg="#FFFFFF"
                                                    keyboardType="numeric"
                                                    value={String(editAroma)}
                                                    onChangeText={(v) => setEditAroma(v)}
                                                    placeholder="0 - 5"
                                                />
                                            </Input>
                                        ) : (
                                            renderStars(selectedEntry.aroma, "sm")
                                        )}
                                    </VStack>

                                    <VStack space="xs">
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <Text color={neutralDark} fontWeight="$bold">
                                                {t("diary.flavor")}
                                            </Text>
                                            <Text color={neutralDark}>{editMode ? `${editFlavor}/5` : `${selectedEntry.flavor}/5`}</Text>
                                        </HStack>
                                        {editMode ? (
                                            <Input>
                                                <InputField
                                                    bg="#FFFFFF"
                                                    keyboardType="numeric"
                                                    value={String(editFlavor)}
                                                    onChangeText={(v) => setEditFlavor(v)}
                                                    placeholder="0 - 5"
                                                />
                                            </Input>
                                        ) : (
                                            renderStars(selectedEntry.flavor, "sm")
                                        )}
                                    </VStack>
                                </VStack>

                                <VStack space="sm" mb="$4">
                                    <Text color={neutralDark} fontWeight="$bold" fontSize="$lg">
                                        {t("diary.notes")}
                                    </Text>

                                    {editMode ? (
                                        <Textarea>
                                            <TextareaInput placeholder={t("diary.notesPlaceholder")} value={editNotes} onChangeText={setEditNotes} multiline />
                                        </Textarea>
                                    ) : (
                                        <Text fontSize="$md" color="$muted">
                                            {selectedEntry.notes || t("general.noItems")}
                                        </Text>
                                    )}
                                </VStack>

                                {selectedEntry.createdAt && (
                                    <VStack space="xs" mb="$4">
                                        <Text color={neutralDark} fontWeight="$bold" fontSize="$sm">
                                            {t("diary.creationDate")}
                                        </Text>
                                        <Text fontSize="$sm" color="$muted">
                                            {new Date(selectedEntry.createdAt).toLocaleDateString("pt-BR", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            })}
                                        </Text>
                                    </VStack>
                                )}

                                <HStack space="sm" justifyContent="flex-end" mt="$2">
                                    {!editMode ? (
                                        <>
                                            <Button variant="outline" borderColor="$error500" onPress={() => setModalVisible(false)}>
                                                <ButtonText color="$error500">{t("diary.close")}</ButtonText>
                                            </Button>
                                            <Button backgroundColor={primary} onPress={handleStartEdit}>
                                                <ButtonText>{t("diary.edit") ?? "Editar"}</ButtonText>
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                onPress={() => {
                                                    setEditMode(false);
                                                    setEditNotes(selectedEntry.notes || "");
                                                    setEditColor(selectedEntry.color ?? 0);
                                                    setEditAroma(selectedEntry.aroma ?? 0);
                                                    setEditFlavor(selectedEntry.flavor ?? 0);
                                                }}
                                            >
                                                <ButtonText>{t("general.cancel")}</ButtonText>
                                            </Button>
                                            <Button backgroundColor={primary} onPress={handleSaveEdit} isDisabled={savingEdit}>
                                                <ButtonText>{savingEdit ? t("general.saving") : t("general.save")}</ButtonText>
                                            </Button>
                                        </>
                                    )}
                                </HStack>
                            </>
                        )}
                    </Box>
                </Box>
            </Modal>

            {entries.length > 0 ? (
                <Button
                    position="absolute"
                    bottom="$16"
                    right="$1.5"
                    size="md"
                    h="$12"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="$full"
                    bgColor={primary}
                    onPress={() => router.push("/(forms)/new-diary-wine-list")}
                >
                    <ButtonText>{t("diary.newDiary")}</ButtonText>
                </Button>
            ) : null}
        </Box>
    );
}
