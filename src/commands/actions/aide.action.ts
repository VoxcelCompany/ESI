import { CacheType, ModalSubmitInteraction } from "discord.js";
import HELP_FIELDS from "../../utils/constants/HelpFields";

interface AideParams {
    interaction: ModalSubmitInteraction<CacheType>;
    version: string;
}

export default async (params: AideParams): Promise<void> => {
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
                fields: HELP_FIELDS,
                timestamp: new Date().toISOString(),
                footer: {
                    text: `Version ${version}`,
                },
            },
        ],
    });
};
