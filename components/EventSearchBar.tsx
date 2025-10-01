// components/EventSearchBar.tsx
import React, { useEffect, useState } from "react";
import { HStack, Input, InputField, Button, ButtonText, Box } from "@gluestack-ui/themed";
import { AntDesign } from "@expo/vector-icons";
import { config } from "@/gluestack-ui.config";

type Props = {
    value?: string;
    onChange: (text: string) => void;
    placeholder?: string;
    debounceMs?: number;
};

export default function EventSearchBar({ value = "", onChange, placeholder = "Pesquisar eventos...", debounceMs = 300 }: Props) {
    const [query, setQuery] = useState(value);
    const primary = config.tokens.colors.primary?.["500"];
    const goldTransparent = "#B89F5B30";
    const primaryTransparent = "#6B223230";
    const accent = config.tokens.colors.primary["800"];
    const bgLight = config.tokens.colors.backgroundLight;

    useEffect(() => {
        setQuery(value);
    }, [value]);

    // debounce simples
    useEffect(() => {
        const handler = setTimeout(() => {
            onChange(query);
        }, debounceMs);

        return () => clearTimeout(handler);
    }, [query, debounceMs, onChange]);

    const clear = () => {
        setQuery("");
        onChange("");
    };

    return (
        <Box mb="$4">
            <HStack alignItems="center" space="sm">
                <Input bgColor="#FFFFFF" flex={1} borderRadius="$lg" px="$3">
                    <InputField
                        bgColor="#FFFFFF"
                        placeholder={placeholder}
                        value={query}
                        onChangeText={setQuery}
                        returnKeyType="search"
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                </Input>

                {query.length > 0 ? (
                    <Button onPress={clear} variant="ghost" size="sm" bgColor="transparent" borderRadius="$full" px="$3">
                        <AntDesign name="closecircle" size={18} />
                    </Button>
                ) : (
                    <Button isDisabled variant="ghost" size="sm" bgColor="transparent" borderRadius="$full" px="$3">
                        <AntDesign name="search1" size={22} />
                    </Button>
                )}
            </HStack>
        </Box>
    );
}
