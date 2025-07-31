// hooks/useAuth.ts
import { useEffect, useState } from "react";
import { auth, setupAuthListener } from "../lib/firebase";
import { User } from "firebase/auth";

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = setupAuthListener((authUser) => {
            setUser(authUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, loading };
};
