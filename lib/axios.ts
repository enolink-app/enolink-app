import axios from "axios";
import { auth } from "./firebase";

export const api = axios.create({
    baseURL: "https://ivino-api.com/api",
});

api.interceptors.request.use(async (config) => {
    try {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const token = await currentUser.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers["Content-Type"] = "application/json";
        return config;
    } catch (error) {
        console.error("Erro no interceptor:", error);
        return config;
    }
});
