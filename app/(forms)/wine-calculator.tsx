import { useState, useEffect } from "react";
import {
    Box,
    VStack,
    FormControl,
    Input,
    InputField,
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
import { Wine, Clock } from "lucide-react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { config } from "@/gluestack-ui.config";
import { Plus, ChevronLeft } from "lucide-react-native";
import { useNavigation } from "expo-router";

type Wine = {
    id: string;
    name: string;
    type: string;
};

type EventFormData = {
    name: string;
    startDate: Date;
    description: string;
    wines: Wine[];
    calculator: {
        guests: number;
        period: "morning" | "afternoon" | "evening";
        consumptionLevel: "low" | "medium" | "high";
        totalBottles?: number; // Nova propriedade
        suggestedTypes?: string[]; // Nova propriedade
    };
};

export default function WineCalculator() {
    const [formData, setFormData] = useState<EventFormData>({
        name: "",
        startDate: new Date(),
        description: "",
        wines: [],
        calculator: {
            guests: 0,
            period: "evening",
            consumptionLevel: "medium",
        },
    });
    const navigation = useNavigation();
    const router = useRouter();
    const [userWines, setUserWines] = useState<Wine[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [title, setTitle] = useState("Próximo");
    const [activeTab, setActiveTab] = useState<"details" | "wines" | "calculator">("calculator");
    const primary = config.tokens.colors.primary?.["500"];
    const bgLight = config.tokens.colors.backgroundLight;
    const neutralLight = config.tokens.colors.muted;
    const textDark = config.tokens.colors.textDark;
    const textLight = config.tokens.colors.textLight;

    useEffect(() => {
        const fetchUserWines = async () => {
            const mockWines: Wine[] = [
                { id: "1", name: "Vinho do Porto", type: "Tinto" },
                { id: "2", name: "Château Margaux", type: "Tinto" },
                { id: "3", name: "Cloudy Bay", type: "Branco" },
            ];
            setUserWines(mockWines);
        };

        fetchUserWines();
    }, []);

    const handleCalculateWines = () => {
        const { guests, period, consumptionLevel } = formData.calculator;

        let multiplier = 1;
        if (consumptionLevel === "low") multiplier = 0.75;
        if (consumptionLevel === "high") multiplier = 1.5;

        // Ajuste baseado no período
        if (period === "morning") multiplier *= 0.7;
        if (period === "afternoon") multiplier *= 0.9;

        const totalBottles = Math.ceil(guests * 0.5 * multiplier);

        // Tipos sugeridos baseados no período
        let suggestedTypes = [];

        if (period === "morning") {
            suggestedTypes = ["Espumante Brut", "Branco leve", "Rosé seco"];
        } else if (period === "afternoon") {
            suggestedTypes = ["Tinto suave", "Branco seco", "Rosé leve"];
        } else {
            // evening
            suggestedTypes = ["Tinto seco", "Espumante Extra Brut", "Branco encorpado"];
        }

        setFormData({
            ...formData,
            calculator: {
                ...formData.calculator,
                totalBottles,
                suggestedTypes,
            },
        });
    };

    const handleNext = () => {
        if (activeTab == "details") {
            setActiveTab("calculator");
        } else if (activeTab == "calculator") {
            setActiveTab("wines");
            setTitle("Criar evento");
        }
    };

    const handlePrevious = () => {
        if (activeTab == "details") {
            router.push("/tabs/(tabs)/events");
        } else if (activeTab == "calculator") {
            setActiveTab("details");
        } else if (activeTab == "wines") {
            setActiveTab("calculator");
            setTitle("Próximo");
        }
    };

    return (
        <Box flex={1} p="$4" mt={50}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$4">
                <HStack justifyContent="space-between" alignItems="center">
                    <ChevronLeft color={textLight} size={40} onPress={() => router.back()} />
                    <Heading size="lg">Calculadora de Vinhos</Heading>
                </HStack>
            </Box>
            <ScrollView py={32} mb="$16">
                {activeTab === "calculator" && (
                    <VStack space="md">
                        <FormControl>
                            <FormControlLabel my={6}>
                                <FormControlLabelText>Quantas pessoas?</FormControlLabelText>
                            </FormControlLabel>
                            <Input borderColor={"$backgroundDark400"}>
                                <InputField
                                    placeholder="Número de convidados"
                                    keyboardType="numeric"
                                    value={formData.calculator.guests.toString()}
                                    onChangeText={(text) =>
                                        setFormData({
                                            ...formData,
                                            calculator: {
                                                ...formData.calculator,
                                                guests: parseInt(text) || 0,
                                            },
                                        })
                                    }
                                />
                            </Input>
                        </FormControl>

                        <FormControl>
                            <FormControlLabel my={6}>
                                <FormControlLabelText>Qual é o período do evento?</FormControlLabelText>
                            </FormControlLabel>
                            <Select
                                defaultValue="Manhã"
                                borderColor={"$backgroundDark400"}
                                selectedValue={formData.calculator.period}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        calculator: {
                                            ...formData.calculator,
                                            period: value as "morning" | "afternoon" | "evening",
                                        },
                                    })
                                }
                            >
                                <SelectTrigger borderColor={"$backgroundDark400"}>
                                    <SelectInput borderColor={"$backgroundDark400"} placeholder="Período do evento" />
                                    <SelectIcon as={Clock} mx={8} />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        <SelectDragIndicatorWrapper>
                                            <SelectDragIndicator />
                                        </SelectDragIndicatorWrapper>
                                        <SelectItem label="Manhã" value="morning" />
                                        <SelectItem label="Tarde" value="afternoon" />
                                        <SelectItem label="Noite" value="evening" />
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormControlLabel my={6}>
                                <FormControlLabelText>Qual é o nível de consumo?</FormControlLabelText>
                            </FormControlLabel>

                            <HStack space="sm">
                                <Checkbox
                                    value="low"
                                    isChecked={formData.calculator.consumptionLevel === "low"}
                                    onChange={(isSelected) =>
                                        isSelected &&
                                        setFormData({
                                            ...formData,
                                            calculator: {
                                                ...formData.calculator,
                                                consumptionLevel: "low",
                                            },
                                        })
                                    }
                                >
                                    <CheckboxIndicator borderRadius={5} borderColor={"$backgroundDark200"}>
                                        <CheckboxIcon backgroundColor={primary} borderRadius={3} borderColor={primary} />
                                    </CheckboxIndicator>
                                    <CheckboxLabel>Baixo</CheckboxLabel>
                                </Checkbox>

                                <Checkbox
                                    value="medium"
                                    isChecked={formData.calculator.consumptionLevel === "medium"}
                                    onChange={(isSelected) =>
                                        isSelected &&
                                        setFormData({
                                            ...formData,
                                            calculator: {
                                                ...formData.calculator,
                                                consumptionLevel: "medium",
                                            },
                                        })
                                    }
                                >
                                    <CheckboxIndicator borderRadius={5} borderColor={"$backgroundDark200"}>
                                        <CheckboxIcon backgroundColor={primary} borderRadius={3} borderColor={primary} />
                                    </CheckboxIndicator>
                                    <CheckboxLabel>Médio</CheckboxLabel>
                                </Checkbox>

                                <Checkbox
                                    value="high"
                                    isChecked={formData.calculator.consumptionLevel === "high"}
                                    onChange={(isSelected) =>
                                        isSelected &&
                                        setFormData({
                                            ...formData,
                                            calculator: {
                                                ...formData.calculator,
                                                consumptionLevel: "high",
                                            },
                                        })
                                    }
                                >
                                    <CheckboxIndicator borderRadius={5} borderColor={"$backgroundDark200"}>
                                        <CheckboxIcon backgroundColor={primary} borderRadius={3} borderColor={primary} />
                                    </CheckboxIndicator>
                                    <CheckboxLabel>Alto</CheckboxLabel>
                                </Checkbox>
                            </HStack>
                        </FormControl>

                        <Button mt="$4" onPress={handleCalculateWines} backgroundColor={primary}>
                            <ButtonText>Calcular Vinhos Necessários</ButtonText>
                        </Button>

                        {formData.calculator.totalBottles > 0 && (
                            <VStack mt="$4" space="sm">
                                <Text fontSize="$lg" fontWeight="$bold">
                                    Resultado:
                                </Text>

                                {/* Ícones de garrafas */}
                                <HStack flexWrap="wrap">
                                    {[...Array(formData.calculator.totalBottles)].map((_, index) => (
                                        <MaterialCommunityIcons key={index} name="bottle-wine" size={24} color="#7f1d1d" style={{ marginRight: 4 }} />
                                    ))}
                                    <Text ml="$2">
                                        {formData.calculator.totalBottles} unidade{[...Array(formData.calculator.totalBottles)].length > 1 ? "s" : ""}
                                    </Text>
                                </HStack>

                                <Text fontSize="$lg" fontWeight="$bold">
                                    Sugestões:
                                </Text>
                                <VStack mb="$2" space="xs">
                                    {formData.calculator.suggestedTypes.map((type, index) => (
                                        <Text key={index}>• {type}</Text>
                                    ))}
                                </VStack>

                                <Text mt="$2" fontSize="$sm" color="$coolGray500">
                                    Baseado em {formData.calculator.guests} convidados, período{" "}
                                    {formData.calculator.period === "morning" ? "da manhã" : formData.calculator.period === "afternoon" ? "da tarde" : "da noite"} e consumo{" "}
                                    {formData.calculator.consumptionLevel === "low" ? "baixo" : formData.calculator.consumptionLevel === "medium" ? "médio" : "alto"}.
                                </Text>
                            </VStack>
                        )}
                    </VStack>
                )}
            </ScrollView>
        </Box>
    );
}
