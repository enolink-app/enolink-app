export const generateInviteLink = (inviteCode: string) => {
    const universalLink = `https://app.enolink.com/join?code=${inviteCode}`;

    const customLink = `enolink://join?code=${inviteCode}`;

    return {
        universalLink,
        customLink,
        shareMessage: `Junte-se ao meu evento no EnoLink! ${universalLink}\n\nSe o link não abrir no app, copie e cole no navegador: ${customLink}`,
    };
};
