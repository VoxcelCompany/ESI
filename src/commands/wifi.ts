import { CacheType, InteractionEditReplyOptions, ModalSubmitInteraction } from "discord.js";

interface WifiParams {
    interaction: ModalSubmitInteraction<CacheType>;
    version: string;
}

export const wifi = async (params: WifiParams): Promise<void> => {
    const { interaction, version } = params;

    await interaction.deferReply({ ephemeral: false });

    const wifiContent: InteractionEditReplyOptions = {
        embeds: [{
            color: 0x42fcff,
            title: `📶 Wifi ENIGMA`,
            description: `Informations concernant la connexion et les identifiants wifi d'ENIGMA\n­`,
            fields: [
                {
                    name: '🔰 Nom de la connexion',
                    value: '`ENIGMA SCHOOL`',
                    inline: false
                }, {
                    name: '🫣 Mot de passe',
                    value: '`CleCan1026#`\n­',
                    inline: true,
                },
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: `Version ${version}`,
            },
        }],
    };

    await interaction.editReply(wifiContent);
}