import { auth } from "../firebase";
export const getCurrentUser = () => {
    return auth.currentUser;
};

export const reauthenticate = async (password: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error("Usuário não autenticado");

    const credential = EmailAuthProvider.credential(user.email, password);
    await auth.reauthenticateWithCredential(user, credential);
};
