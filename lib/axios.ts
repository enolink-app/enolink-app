// lib/axios.ts
import axios from "axios";
import { getAuth } from "firebase/auth";

// Firebase Auth
const auth = getAuth();

export const api = axios.create({
    baseURL: "https://ivino-api.com/api",
    // timeout: 10000,
});

// Interceptor para incluir token automático
api.interceptors.request.use(async (config) => {
    const currentUser = auth.currentUser;

    if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Content-Type"] = "application/json";

    return config;
});
