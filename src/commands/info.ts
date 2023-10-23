import { CacheType, ModalSubmitInteraction } from 'discord.js';
import firebaseRepository from '../repository/firebase.repository';
import { getMomentDate } from '../utils/dates';
import enigmaService from '../service/enigma.service';
import Cursus from '../utils/enum/Cursus';

interface IInfoParams {
    interaction: ModalSubmitInteraction<CacheType>;
    version: string;
    botUptime: Date;
}

export const info = async (params: IInfoParams): Promise<void> => {
    const { interaction, botUptime, version } = params;

    const { discordPing, uptime } = {
        discordPing: `${Math.abs(new Date().getTime() - interaction.createdTimestamp)}ms`,
        uptime: getMomentDate(botUptime).format("[En ligne depuis le] DD/MM/YYYY [à] HH[h]mm"),
    };

    await interaction.deferReply({ ephemeral: false });

    const firstDbDate = new Date();
    await firebaseRepository.getAllData('edt');
    const dbDate = `${new Date().getTime() - firstDbDate.getTime()}ms`;

    const firstMicrosoftDate = new Date();
    await enigmaService.getEdtFileDataFromApi(Cursus.RETAIL);
    const microsoftDate = `${new Date().getTime() - firstMicrosoftDate.getTime()}ms`;

    await interaction.editReply({
        embeds: [{
            color: 0xff0000,
            title: `ℹ️ Informations`,
            description: `Voici les informations sur le Bot v${version}\n­`,
            fields: [
                { name: `🕒 Uptime`, value: uptime, inline: false },
                { name: `🏓 Ping Discord`, value: discordPing, inline: true },
                { name: `🖥️ Ping Database`, value: dbDate, inline: true },
                { name: `🗂️ Ping Microsoft`, value: microsoftDate, inline: true },
            ],
            timestamp: new Date().toISOString(),
        }],
    });
};