// stores/wineStore.ts
import { create } from "zustand";
import { useRequest } from "@/hooks/useRequest";
import { api } from "@/lib/axios";
type Wine = {
    name: string;
    harvest: string;
    country: string;
    type: string;
    description: string;
    image: string;
    // Adicione createdAt, updatedAt se precisar aqui no cliente também
};

interface WineState {
    userWines: Wine[];
    loading: boolean;
    error: string | null;
    fetchUserWines: (organizerId: string) => Promise<void>;
    addWine: (newWine: Wine) => void;
}

export const useWineStore = create<WineState>((set, get) => ({
    userWines: [],
    loading: false,
    error: null,

    fetchUserWines: async (organizerId: string) => {
        set({ loading: true, error: null });
        try {
            return await api
                .get(`/wines`)
                .then((response) => {
                    set({ userWines: response?.data, loading: false });
                })
                .catch((error) => {
                    console.log(`Ops! Algo deu errado: ${error}`);
                    set({ error: error.response?.data?.error && error, loading: false });
                });
        } catch (err: any) {
            console.error("Erro ao buscar vinhos:", err);
        }
    },

    addWine: (newWine: Wine) => {
        set((state) => ({
            userWines: [...state.userWines, newWine],
        }));
    },
}));
