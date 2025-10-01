import React, { useState, useRef, useEffect } from "react";
import { Dimensions, Animated, PanResponder, View } from "react-native";
import { Box, Text, Button, ButtonText, HStack, VStack, Image } from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import { setOnboarded } from "@/utils/firstLaunch";
import { Trophy, Wine, BookOpenText, Smartphone } from "lucide-react-native";
import useLanguageStore from "@/stores/useLanguageStore";
import { config } from "@/gluestack-ui.config";

const { width, height } = Dimensions.get("window");

export default function Onboarding() {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];

    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    const onboardingSlides = [
        {
            id: 1,
            title: `${t("onboarding.titleApp1")}`,
            description: `${t("onboarding.subtitleApp1")}`,
            image: require("@/assets/images/onboarding1.png"),
            icon: "trophy",
        },
        {
            id: 2,
            title: `${t("onboarding.titleApp2")}`,
            description: `${t("onboarding.subtitleApp2")}`,
            image: require("@/assets/images/onboarding2.png"),
            icon: "wine",
        },
        {
            id: 3,
            title: `${t("onboarding.titleApp3")}`,
            description: `${t("onboarding.subtitleApp3")}`,
            image: require("@/assets/images/onboarding3.png"),
            icon: "notes",
        },
        {
            id: 4,
            title: `${t("onboarding.titleApp4")}`,
            description: `${t("onboarding.subtitleApp4")}`,
            image: require("@/assets/images/onboarding4.png"),
            icon: "phone",
        },
    ];

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 10;
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx < -50) {
                    // Swipe para esquerda - próximo
                    handleNext();
                } else if (gestureState.dx > 50) {
                    // Swipe para direita - anterior
                    handlePrevious();
                }
            },
        })
    ).current;

    const animateTransition = (direction: "next" | "previous") => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setCurrentSlide((prev) => (direction === "next" ? Math.min(prev + 1, onboardingSlides.length - 1) : Math.max(prev - 1, 0)));

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    const handleNext = () => {
        if (currentSlide < onboardingSlides.length - 1) {
            animateTransition("next");
        } else {
            finishOnboarding();
        }
    };

    const handlePrevious = () => {
        if (currentSlide > 0) {
            animateTransition("previous");
        }
    };

    const handleSkip = () => {
        finishOnboarding();
    };

    const handleDotPress = (index: number) => {
        if (index !== currentSlide) {
            const direction = index > currentSlide ? "next" : "previous";
            animateTransition(direction);
        }
    };

    const finishOnboarding = async () => {
        await setOnboarded();
        router.replace("/splash");
    };

    const isLastSlide = currentSlide === onboardingSlides.length - 1;
    const isFirstSlide = currentSlide === 0;

    const animatedContentStyle = {
        opacity: fadeAnim,
        transform: [
            { scale: scaleAnim },
            {
                translateX: slideAnim.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [-20, 0, 20],
                }),
            },
        ],
    };

    return (
        <Box key={updateKey} flex={1} bg="$backgroundLight">
            <HStack justifyContent="space-between" alignItems="center" p="$6" pt="$8">
                <HStack space="sm" alignItems="center">
                    {onboardingSlides.map((_, index) => (
                        <Button key={index} variant="link" p="$1" onPress={() => handleDotPress(index)}>
                            <Box
                                w="$3"
                                h="$3"
                                borderRadius="$full"
                                bg={index === currentSlide ? primary : index < currentSlide ? primary + "50" : "$muted300"}
                                style={{
                                    transform: [{ scale: index === currentSlide ? 1.2 : 1 }],
                                }}
                            />
                        </Button>
                    ))}
                </HStack>

                <Button variant="link" onPress={handleSkip}>
                    <ButtonText color="$muted" fontSize="$sm" fontWeight="$medium">
                        {isLastSlide ? "Iniciar" : "Pular"}
                    </ButtonText>
                </Button>
            </HStack>

            <View style={{ flex: 1 }} {...panResponder.panHandlers}>
                <Animated.View style={[{ flex: 1 }, animatedContentStyle]}>
                    <Box flex={1} justifyContent="center" alignItems="center" px="$6">
                        <Animated.View
                            style={{
                                marginBottom: 24,
                                transform: [
                                    {
                                        rotate: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ["-10deg", "0deg"],
                                        }),
                                    },
                                ],
                            }}
                        >
                            <Text fontSize="$2xl" fontWeight="$bold" textAlign="center" lineHeight="$3xl" color="#252525">
                                {onboardingSlides[currentSlide].title}
                            </Text>
                        </Animated.View>

                        <Animated.View
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: fadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 0.15],
                                }),
                                shadowRadius: 16,
                                elevation: 8,
                            }}
                        >
                            <Image
                                source={onboardingSlides[currentSlide].image}
                                alt={onboardingSlides[currentSlide].title}
                                w={width * 0.8}
                                h={height * 0.3}
                                resizeMode="cover"
                                mb="$8"
                                borderRadius="$2xl"
                                style={{
                                    borderWidth: 1,
                                    borderColor: "rgba(0,0,0,0.1)",
                                }}
                            />
                        </Animated.View>

                        <VStack space="lg" alignItems="center" maxWidth={width * 0.9}>
                            <Animated.View
                                style={{
                                    transform: [
                                        {
                                            translateY: fadeAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [30, 0],
                                            }),
                                        },
                                    ],
                                }}
                            >
                                <Text fontSize="$lg" textAlign="center" color="$muted" lineHeight="$xl">
                                    {onboardingSlides[currentSlide].description}
                                </Text>
                            </Animated.View>
                        </VStack>
                    </Box>
                </Animated.View>
            </View>

            <Box p="$6" pb="$10">
                <HStack space="md" alignItems="center" justifyContent="center">
                    {!isFirstSlide && (
                        <Button variant="outline" flex={1} maxWidth={120} onPress={handlePrevious} borderColor={primary} borderRadius="$lg">
                            <ButtonText color={primary} fontWeight="$medium">
                                ← Voltar
                            </ButtonText>
                        </Button>
                    )}

                    <Button
                        bg={primary}
                        flex={isFirstSlide ? 1 : 2}
                        onPress={handleNext}
                        borderRadius="$lg"
                        style={{
                            shadowColor: primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 4,
                        }}
                    >
                        <ButtonText fontWeight="$bold" fontSize="$md">
                            {isLastSlide ? "🍷 Começar Jornada" : "Próximo →"}
                        </ButtonText>
                    </Button>
                </HStack>

                <Box bg="$muted100" borderRadius="$full" h="$1" mt="$4" overflow="hidden">
                    <Animated.View
                        style={{
                            height: "100%",
                            backgroundColor: primary,
                            borderRadius: 999,
                            width: `${((currentSlide + 1) / onboardingSlides.length) * 100}%`,
                            transform: [
                                {
                                    scaleX: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.8, 1],
                                    }),
                                },
                            ],
                        }}
                    />
                </Box>

                <Text textAlign="center" color="$muted" fontSize="$sm" mt="$2">
                    {currentSlide + 1} de {onboardingSlides.length}
                </Text>
            </Box>
        </Box>
    );
}
