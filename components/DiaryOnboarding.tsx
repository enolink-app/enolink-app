// components/DiaryOnboarding.tsx
import React, { useState, useEffect } from "react";
import { Modal, StyleSheet } from "react-native";
import { Box, Text, Button, ButtonText, VStack, HStack, Image } from "@gluestack-ui/themed";
import { setDiaryOnboarded } from "@/utils/firstLaunch";
import useLanguageStore from "@/stores/useLanguageStore";
import { config } from "@/gluestack-ui.config";

interface DiaryOnboardingProps {
    visible: boolean;
    onClose: () => void;
}

export default function DiaryOnboarding({ visible, onClose }: DiaryOnboardingProps) {
    const [currentStep, setCurrentStep] = React.useState(0);
    const { t, forceUpdate } = useLanguageStore();
    const [updateKey, setUpdateKey] = useState(0);
    const primary = config.tokens.colors.primary["500"];
    const neutralDark = config.tokens.colors.primary["600"];
    const neutralLight = config.tokens.colors.primary["700"];
    const accent = config.tokens.colors.primary["800"];
    const gold = config.tokens.colors.primary["900"];
    const textDark = config.tokens.colors.textDark;
    const textLight = config.tokens.colors.textLight;
    const goldTransparent = "#B89F5B30";
    const primaryTransparent = "#6B223230";
    const bgLight = config.tokens.colors.backgroundLight;

    useEffect(() => {
        setUpdateKey((prev) => prev + 1);
    }, [forceUpdate]);

    const diaryOnboardingSteps = [
        {
            title: `${t("onboarding.titleDiary1")}`,
            description: `${t("onboarding.subtitleDiary1")}`,
            tip: `${t("onboarding.descriptionDiary1")}`,
        },
        {
            title: `${t("onboarding.titleDiary2")}`,
            description: `${t("onboarding.subtitleDiary2")}`,
            tip: `${t("onboarding.descriptionDiary2")}`,
        },
        {
            title: `${t("onboarding.titleDiary3")}`,
            description: `${t("onboarding.subtitleDiary3")}`,
            tip: `${t("onboarding.descriptionDiary3")}`,
        },
        {
            title: `${t("onboarding.titleDiary4")}`,
            description: `${t("onboarding.subtitleDiary4")}`,
            tip: `${t("onboarding.descriptionDiary4")}`,
        },
    ];

    const handleNext = async () => {
        if (currentStep < diaryOnboardingSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            await setDiaryOnboarded();
            onClose();
        }
    };

    const isLastStep = currentStep === diaryOnboardingSteps.length - 1;

    return (
        <Modal key={updateKey} visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <Box flex={1} justifyContent="center" alignItems="center" bg="rgba(0,0,0,0.7)">
                <Box bg={neutralLight} borderRadius="$xl" p="$6" mx="$4" w="90%" maxWidth={400}>
                    <VStack space="lg" alignItems="center">
                        <HStack space="sm">
                            {diaryOnboardingSteps.map((_, index) => (
                                <Box key={index} w="$2" h="$2" borderRadius="$full" bg={index === currentStep ? primary : "$muted300"} />
                            ))}
                        </HStack>

                        <VStack space="md" alignItems="center">
                            <Text fontSize="$xl" fontWeight="$bold" color={neutralDark} textAlign="center">
                                {diaryOnboardingSteps[currentStep].title}
                            </Text>

                            <Text textAlign="center" color="$muted">
                                {diaryOnboardingSteps[currentStep].description}
                            </Text>

                            <Box bg={primaryTransparent} p="$3" borderRadius="$md" mt="$2">
                                <Text fontSize="$sm" color={primary} textAlign="center">
                                    💡 {diaryOnboardingSteps[currentStep].tip}
                                </Text>
                            </Box>
                        </VStack>

                        <Button w="$full" bg={primary} onPress={handleNext}>
                            <ButtonText>{isLastStep ? t("onboarding.gotIt") : t("onboarding.next")}</ButtonText>
                        </Button>

                        {!isLastStep && (
                            <Button variant="link" onPress={onClose}>
                                <ButtonText color="$muted">{t("onboarding.skip")}</ButtonText>
                            </Button>
                        )}
                    </VStack>
                </Box>
            </Box>
        </Modal>
    );
}
