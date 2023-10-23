import { CacheType, ModalSubmitInteraction } from "discord.js";

interface AideParams {
    interaction: ModalSubmitInteraction<CacheType>;
    version: string;
}

export const aide = async (params: AideParams): Promise<void> => {
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
                        name: `/osi {option}`,
                        value: `Permet de récupérer le mémo OSI. Deux options vous sont proposés, soit le mémo sous forme d'image, soit le mémo sous forme de texte qui est lui beaucoup plus simple à retenir...`,
                    },
                    {
                        name: `/wifi`,
                        value: `Permet de récupérer les informations à propos de la connexion internet d'ENIGMA.`,
                    },
                    {
                        name: `/info`,
                        value: `Permet de récupérer le ping des différents API utilisés ainsi que la version du bot.`,
                    },
                    {
                        name: `Et en bonus`,
                        value: `Bien du plaisir...\n­`,
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
