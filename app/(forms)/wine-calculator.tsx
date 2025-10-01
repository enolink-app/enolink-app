// components/WineCalculator.tsx (ou screens/WineCalculator.tsx)
import { useState, useEffect } from "react";
import {
    Box,
    VStack,
    FormControl,
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
    FormControlLabel,
    FormControlLabelText,
    Heading,
} from "@gluestack-ui/themed";
import { Platform } from "react-native";
import { Clock } from "lucide-react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import useLanguageStore from "@/stores/useLanguageStore";
import { Minus, Plus } from "lucide-react-native";
import { config } from "@/gluestack-ui.config";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Wine = {
    id: string;
    name: string;
    type: string;
};

export default function WineCalculator() {
    type EventFormData = {
        name: string;
        startDate: Date;
        description: string;
        wines: Wine[];
        calculator: {
            guests: number;
            period: "morning" | "afternoon" | "evening";
            consumptionLevel: "low" | "medium" | "high";
            totalBottles?: number;
            suggestedTypes?: string[];
            bottleSuggestions?: string[];
        };
    };

    const [formData, setFormData] = useState<EventFormData>({
        name: "",
        startDate: new Date(),
        description: "",
        wines: [],
        calculator: {
            guests: 0,
            period: "morning",
            consumptionLevel: "medium",
        },
    });

    const route = useRouter();
    const [userWines, setUserWines] = useState<Wine[]>([]);
    const [title, setTitle] = useState("Próximo");
    const [activeTab, setActiveTab] = useState<"details" | "wines" | "calculator">("calculator");
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);

    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];

    const PERIOD_OPTIONS = [
        { value: "morning", label: t("forms.wineCalculator.morning") },
        { value: "afternoon", label: t("forms.wineCalculator.afternoon") },
        { value: "evening", label: t("forms.wineCalculator.evening") },
    ];

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    useEffect(() => {
        const mockWines: Wine[] = [
            { id: "1", name: "Vinho do Porto", type: "Tinto" },
            { id: "2", name: "Château Margaux", type: "Tinto" },
            { id: "3", name: "Cloudy Bay", type: "Branco" },
        ];
        setUserWines(mockWines);
    }, []);

    function getTranslatedArray(keyBase: string, maxItems = 40): string[] {
        try {
            const arr = t(keyBase, { returnObjects: true });
            if (Array.isArray(arr)) return arr as string[];
        } catch (e) {
            console.log("Ops! Algo deu errado: ", e);
        }
        const out: string[] = [];
        for (let i = 0; i < maxItems; i++) {
            const k = `${keyBase}.${i}`;
            const v = t(k);
            if (!v || v === k) break;
            out.push(v);
        }
        return out;
    }

    const handleCalculateWines = () => {
        const { guests, period, consumptionLevel } = formData.calculator;

        let multiplier = 1;
        if (consumptionLevel === "low") multiplier = 0.75;
        if (consumptionLevel === "high") multiplier = 1.5;

        if (period === "morning") multiplier *= 0.7;
        if (period === "afternoon") multiplier *= 0.9;

        const totalBottles = Math.max(0, Math.ceil(guests * 0.5 * multiplier));

        let suggestedTypes = getTranslatedArray(`forms.wineCalculator.suggestedTypes.${period}`);

        if (!suggestedTypes || suggestedTypes.length === 0) {
            if (period === "morning") {
                suggestedTypes = [
                    t("forms.wineCalculator.suggestedFallback.sparkling"),
                    t("forms.wineCalculator.suggestedFallback.lightWhite"),
                    t("forms.wineCalculator.suggestedFallback.rose"),
                ];
            } else if (period === "afternoon") {
                suggestedTypes = [t("forms.wineCalculator.suggestedFallback.mediumRed"), t("forms.wineCalculator.suggestedFallback.structuredWhite")];
            } else {
                suggestedTypes = [t("forms.wineCalculator.suggestedFallback.fullRed"), t("forms.wineCalculator.suggestedFallback.port")];
            }
        }

        const bottleSuggestions =
            totalBottles >= 6
                ? getTranslatedArray(`forms.wineCalculator.bottleSuggestions.large`)
                : totalBottles >= 3
                ? getTranslatedArray(`forms.wineCalculator.bottleSuggestions.medium`)
                : [];

        setFormData((prev) => ({
            ...prev,
            calculator: {
                ...prev.calculator,
                totalBottles,
                suggestedTypes,
                bottleSuggestions,
            },
        }));
    };

    const getCurrentPeriodLabel = () => {
        const periodOption = PERIOD_OPTIONS.find((option) => option.value === formData.calculator.period);
        return periodOption ? periodOption.label : t("forms.wineCalculator.period");
    };

    const getTranslatedPeriodForText = (periodValue: string) => {
        switch (periodValue) {
            case "morning":
                return t("forms.wineCalculator.morning2");
            case "afternoon":
                return t("forms.wineCalculator.afternoon2");
            case "evening":
                return t("forms.wineCalculator.evening2");
            default:
                return periodValue;
        }
    };

    return (
        <Box key={updateKey} flex={1} p="$4" mt={Platform.OS == "ios" ? 50 : 0} bg={neutralLight}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                <HStack justifyContent="space-between" alignItems="center">
                    <ChevronLeft key="half" size={30} style={{ marginRight: 6 }} color={accent} onPress={() => route.back()} />
                    <Heading size="lg" color={accent}>
                        {t("forms.wineCalculator.title")}
                    </Heading>
                </HStack>
            </Box>

            <ScrollView py={32} mb="$16">
                {activeTab === "calculator" && (
                    <VStack space="md">
                        <FormControl>
                            <FormControlLabel my={6}>
                                <FormControlLabelText>{t("forms.wineCalculator.howMany")}</FormControlLabelText>
                            </FormControlLabel>
                            <HStack alignItems="center" space="md">
                                <Button
                                    size="sm"
                                    onPress={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            calculator: { ...prev.calculator, guests: Math.max(0, prev.calculator.guests - 1) },
                                        }))
                                    }
                                    disabled={formData.calculator.guests <= 0}
                                    backgroundColor={formData.calculator.guests <= 0 ? accent + "50" : accent}
                                >
                                    <ButtonText>
                                        <Minus size={20} color="white" />
                                    </ButtonText>
                                </Button>

                                <Box minWidth="$16" alignItems="center" justifyContent="center" borderWidth={1} borderColor="$backgroundDark400" borderRadius="$md" px="$2" py="$1">
                                    <Text fontSize="$lg" fontWeight="$bold">
                                        {formData.calculator.guests}
                                    </Text>
                                </Box>

                                <Button
                                    size="sm"
                                    onPress={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            calculator: { ...prev.calculator, guests: prev.calculator.guests + 1 },
                                        }))
                                    }
                                    backgroundColor={accent}
                                >
                                    <ButtonText>
                                        <Plus size={20} color="white" />
                                    </ButtonText>
                                </Button>
                            </HStack>
                        </FormControl>

                        <FormControl>
                            <FormControlLabel my={6}>
                                <FormControlLabelText>{t("forms.wineCalculator.period")}</FormControlLabelText>
                            </FormControlLabel>
                            <Select
                                selectedValue={formData.calculator.period}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, calculator: { ...prev.calculator, period: value as any } }))}
                            >
                                <SelectTrigger borderColor={"$backgroundDark400"}>
                                    <SelectInput placeholder={t("forms.wineCalculator.period")} value={getCurrentPeriodLabel()} />
                                    <SelectIcon as={Clock} mx={8} />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        <SelectDragIndicatorWrapper>
                                            <SelectDragIndicator />
                                        </SelectDragIndicatorWrapper>

                                        {PERIOD_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} label={option.label} value={option.value} />
                                        ))}
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormControlLabel my={6}>
                                <FormControlLabelText>{t("forms.wineCalculator.level")}</FormControlLabelText>
                            </FormControlLabel>

                            <VStack space="sm">
                                <Checkbox
                                    value="low"
                                    isChecked={formData.calculator.consumptionLevel === "low"}
                                    onChange={(isSelected) => isSelected && setFormData((prev) => ({ ...prev, calculator: { ...prev.calculator, consumptionLevel: "low" } }))}
                                >
                                    <CheckboxIndicator borderRadius={5} borderColor={"$backgroundDark200"}>
                                        <CheckboxIcon backgroundColor={accent} borderRadius={3} borderColor={accent} />
                                    </CheckboxIndicator>
                                    <CheckboxLabel fontWeight={"$bold"} mx="$4">
                                        {t("forms.wineCalculator.low")}
                                    </CheckboxLabel>
                                    <CheckboxLabel>{t("forms.wineCalculator.lowEx")}</CheckboxLabel>
                                </Checkbox>

                                <Checkbox
                                    value="medium"
                                    isChecked={formData.calculator.consumptionLevel === "medium"}
                                    onChange={(isSelected) => isSelected && setFormData((prev) => ({ ...prev, calculator: { ...prev.calculator, consumptionLevel: "medium" } }))}
                                >
                                    <CheckboxIndicator borderRadius={5} borderColor={"$backgroundDark200"}>
                                        <CheckboxIcon backgroundColor={accent} borderRadius={3} borderColor={accent} />
                                    </CheckboxIndicator>
                                    <CheckboxLabel fontWeight={"$bold"} mx="$4">
                                        {t("forms.wineCalculator.medium")}
                                    </CheckboxLabel>
                                    <CheckboxLabel>{t("forms.wineCalculator.mediumEx")}</CheckboxLabel>
                                </Checkbox>

                                <Checkbox
                                    value="high"
                                    isChecked={formData.calculator.consumptionLevel === "high"}
                                    onChange={(isSelected) => isSelected && setFormData((prev) => ({ ...prev, calculator: { ...prev.calculator, consumptionLevel: "high" } }))}
                                >
                                    <CheckboxIndicator borderRadius={5} borderColor={"$backgroundDark200"}>
                                        <CheckboxIcon backgroundColor={accent} borderRadius={3} borderColor={accent} />
                                    </CheckboxIndicator>
                                    <CheckboxLabel fontWeight={"$bold"} mx="$4">
                                        {t("forms.wineCalculator.high")}
                                    </CheckboxLabel>
                                    <CheckboxLabel>{t("forms.wineCalculator.highEx")}</CheckboxLabel>
                                </Checkbox>
                            </VStack>
                        </FormControl>

                        <Button mt="$4" onPress={handleCalculateWines} backgroundColor={accent}>
                            <ButtonText>{t("forms.wineCalculator.submit")}</ButtonText>
                        </Button>

                        {formData.calculator.totalBottles! > 0 && (
                            <VStack mt="$4" space="sm">
                                <Text fontSize="$lg" fontWeight="$bold">
                                    {t("forms.wineCalculator.result")}:
                                </Text>

                                <HStack flexWrap="wrap" alignItems="center">
                                    {[...Array(formData.calculator.totalBottles || 0)].map((_, index) => (
                                        <MaterialCommunityIcons key={index} name="bottle-wine" size={24} color={primary} style={{ marginRight: 4 }} />
                                    ))}
                                    <Text ml="$2" fontSize="$md">
                                        {formData.calculator.totalBottles} {t("forms.wineCalculator.totalBottle")}
                                        {formData.calculator.totalBottles! > 1 ? "s" : ""} {t("forms.wineCalculator.recommended")}
                                        {formData.calculator.totalBottles! > 1 ? "s" : ""}
                                    </Text>
                                </HStack>

                                <Text fontSize="$lg" fontWeight="$bold" mt="$2">
                                    {t("forms.wineCalculator.suggestions")}:
                                </Text>

                                <VStack mb="$2" space="xs">
                                    {formData.calculator.suggestedTypes?.map((type, index) => (
                                        <Text key={index} fontSize="$sm">
                                            • {type}
                                        </Text>
                                    ))}
                                </VStack>

                                {formData.calculator.bottleSuggestions && formData.calculator.bottleSuggestions.length > 0 && (
                                    <>
                                        <Text fontSize="$md" fontWeight="$bold" mt="$2">
                                            {t("forms.wineCalculator.variety")}
                                        </Text>
                                        <VStack space="xs">
                                            {formData.calculator.bottleSuggestions.map((tip, index) => (
                                                <Text key={index} fontSize="$sm" color="$blue600" fontStyle="italic">
                                                    💡 {tip}
                                                </Text>
                                            ))}
                                        </VStack>
                                    </>
                                )}

                                <Text mt="$2" fontSize="$sm" color="$coolGray500">
                                    {t("forms.wineCalculator.based")} {formData.calculator.guests} {t("forms.wineCalculator.guests")},{" "}
                                    {getTranslatedPeriodForText(formData.calculator.period)}{" "}
                                    {formData.calculator.consumptionLevel === "low"
                                        ? t("forms.wineCalculator.lowC")
                                        : formData.calculator.consumptionLevel === "medium"
                                        ? t("forms.wineCalculator.mediumC")
                                        : t("forms.wineCalculator.highC")}
                                    .
                                </Text>
                            </VStack>
                        )}
                    </VStack>
                )}
            </ScrollView>
        </Box>
    );
}
