// components/LanguageProvider.tsx
import React, { useEffect } from "react";
import useLanguageStore from "@/stores/useLanguageStore";

interface LanguageProviderProps {
    children: React.ReactNode;
}

const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const { forceUpdate, initialize } = useLanguageStore();

    useEffect(() => {
        initialize();
    }, []);

    return <>{children}</>;
};

export default LanguageProvider;
