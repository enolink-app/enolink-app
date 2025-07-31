import { Box, ScrollView, Text, Heading, VStack } from "@gluestack-ui/themed";

export default function PrivacyPolicyScreen() {
    return (
        <Box flex={1} bg="$backgroundLight" p="$4">
            <ScrollView showsVerticalScrollIndicator={false}>
                <VStack space="lg">
                    <Heading size="xl" color="$textLight">
                        Termos de Uso
                    </Heading>

                    <Text color="$textLight" fontSize="$md" lineHeight="$md">
                        Ao utilizar o aplicativo WineApp, você concorda com os nossos termos e condições. Este aplicativo foi desenvolvido para fins de degustação e avaliação de
                        vinhos. Não nos responsabilizamos por uso indevido das funcionalidades.
                    </Text>

                    <Text color="$textLight" fontSize="$md" lineHeight="$md">
                        Os dados fornecidos pelos usuários, como nome, e-mail e avaliações, são armazenados com segurança e utilizados apenas para melhorar a experiência da
                        plataforma.
                    </Text>

                    <Heading size="xl" color="$textLight" mt="$6">
                        Política de Privacidade
                    </Heading>

                    <Text color="$textLight" fontSize="$md" lineHeight="$md">
                        Todas as informações pessoais são tratadas com confidencialidade e nunca serão compartilhadas com terceiros sem consentimento.
                    </Text>

                    <Text color="$textLight" fontSize="$md" lineHeight="$md">
                        Ao cadastrar-se, você autoriza o WineApp a utilizar seus dados apenas dentro do escopo da aplicação. Você pode solicitar a exclusão da sua conta a qualquer
                        momento.
                    </Text>

                    <Text color="$muted" fontSize="$sm" mt="$6" textAlign="center">
                        Última atualização: 02 de julho de 2025
                    </Text>
                </VStack>
            </ScrollView>
        </Box>
    );
}
