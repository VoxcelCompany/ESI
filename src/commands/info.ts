import {CacheType, ModalSubmitInteraction} from 'discord.js';
import firebaseRepository from '../repository/firebase.repository';
import {getCurrentDate} from '../tasks/dates';

interface IInfoParams {
    interaction: ModalSubmitInteraction<CacheType>;
    version: string;
    time: Date;
    botUptime: Date;
}

export const info = async (params: IInfoParams): Promise<any> => {
    const { interaction, time, botUptime, version } = params;

    const { discordPing, botPing, uptime } = {
        discordPing: `${Math.abs(new Date().getTime() - interaction.createdTimestamp)}ms`,
        botPing: `${new Date().getTime() - new Date(time).getTime()}ms`,
        uptime: getCurrentDate(botUptime).format("[En ligne depuis le] DD/MM/YYYY [à] HH[h]mm"),
    };

    await interaction.deferReply({ ephemeral: false });

    const firstDbDate = new Date();
    await firebaseRepository.getAllData('edt');
    const dbDate = `${new Date().getTime() - firstDbDate.getTime()}ms`;

    return await interaction.editReply({
        embeds: [{
            color: 0x42fcff,
            title: `ℹ️ Informations`,
            description: `Voici les informations sur le Bot v${version}\n­`,
            fields: [
                { name: `🕒 Uptime`, value: uptime, inline: true },
                { name: `🏓 Ping Bot`, value: botPing, inline: true },
                { name: `🏓 Ping Discord`, value: discordPing, inline: true },
                { name: `🖥️ Ping Database`, value: dbDate, inline: true },
            ],
            timestamp: new Date().toISOString(),
        }],
    });
};