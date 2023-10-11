import {CacheType, InteractionEditReplyOptions, ModalSubmitInteraction} from "discord.js";

interface IWifiParams {
    interaction: ModalSubmitInteraction<CacheType>;
    version: string;
}

export const wifi = async (params: IWifiParams): Promise<any> => {
    const {interaction, version} = params;
    
    await interaction.deferReply({ephemeral: false});
    
    const wifiContent: InteractionEditReplyOptions = {
        embeds: [{
            color: 0x42fcff,
            title: `📶 Wifi Enigma`,
            description: `Informations concernant la connexion et les identifiants wifi d'Enigma\n­`,
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
    
    return await interaction.editReply(wifiContent).catch(() => {
    });
};