import { CacheType, ModalSubmitInteraction } from "discord.js";

interface IAideParams {
    interaction: ModalSubmitInteraction<CacheType>;
    version: string;
}

export const aide = async (params: IAideParams): Promise<void> => {
    const { interaction, version } = params;
    await interaction.deferReply({
        ephemeral: false,
    });

    await interaction.editReply({
        embeds: [
            {
                title: `Aide`,
                description: `Liste des commandes proposés par Gunther\n­`,
                thumbnail: {
                    url: "https://64.media.tumblr.com/0203de9c403a0da0ef7bf61e435cee0c/tumblr_mm7gdb53IN1re7l7wo1_r1_250.gif",
                },
                color: 0xff0000,
                fields: [
                    {
                        name: `/edt {semaine} (section)`,
                        value: `Permet de récupérer l'emploi du temps sélectionné. Trois semaines vous serront proposés lors de l'entrée de la commande, à savoir qu'à partir de samedi la semaine actuelle est considérée comme étant la semaine du lundi suivant. La section est un paramètre optionnel.`,
                    },
                    {
                        name: `/wifi`,
                        value: `Permet de récupérer les informations à propos de la connexion internet d'ENIGMA.`,
                    },
                    {
                        name: `/info`,
                        value: `Permet de récupérer le ping des différents API utilisés ainsi que la version du bot.\n­`,
                    },
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: `Version ${version}`,
                },
            },
        ],
    });
};
