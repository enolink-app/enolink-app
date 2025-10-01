import AsyncStorage from "@react-native-async-storage/async-storage";

export const checkFirstLaunch = async (): Promise<boolean> => {
    try {
        const hasOnboarded = await AsyncStorage.getItem("hasOnboarded");
        return hasOnboarded !== "true";
    } catch (error) {
        console.error("Error checking first launch:", error);
        return true;
    }
};

export const setOnboarded = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem("hasOnboarded", "true");
    } catch (error) {
        console.error("Error setting onboarded:", error);
    }
};

export const checkDiaryFirstLaunch = async (): Promise<boolean> => {
    try {
        const hasDiaryOnboarded = await AsyncStorage.getItem("hasDiaryOnboarded");
        return hasDiaryOnboarded !== "true";
    } catch (error) {
        console.error("Error checking diary first launch:", error);
        return true;
    }
};

export const setDiaryOnboarded = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem("hasDiaryOnboarded", "true");
    } catch (error) {
        console.error("Error setting diary onboarded:", error);
    }
};
