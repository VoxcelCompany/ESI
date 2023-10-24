import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CacheType,
    Client,
    GuildMember,
    ModalSubmitInteraction,
} from "discord.js";
import discordFormatterService from "../service/discordFormatter.service";
import edtService from "../service/edt.service";
import { getCustomizedDate } from "../utils/dates";
import CommandType from "../utils/enum/CommandType";
import Cursus from "../utils/enum/Cursus";
import { capitalize } from "../utils/stringManager";

interface EdtParams {
    weekNumber: string;
    typeNumber?: string;
    interaction: ModalSubmitInteraction<CacheType>;
    type: CommandType;
    client: Client;
}

export const edt = async (params: EdtParams): Promise<void> => {
    const { weekNumber, typeNumber, interaction, type, client } = params;

    if (type == CommandType.BUTTON) {
        await interaction.deferUpdate();
    } else {
        await interaction.deferReply({ ephemeral: false });
    }

    const userCursusRes = edtService.getUserCursus(interaction.member as GuildMember, +typeNumber);

    if (userCursusRes.errorMessage) {
        await interaction.editReply(userCursusRes.errorMessage);
        return;
    }

    const userCursus = userCursusRes.userCursus;

    const edtDatas = await edtService.getEdtDatas(+weekNumber, userCursus, client);
    const messageFields = discordFormatterService.formatEdtCommandFields(edtDatas);

    const weekDate = getCustomizedDate(+weekNumber - 1);
    const displayDate = weekDate.format("DD/MM/YYYY");
    const diplayWeek = {
        "1": "Cette semaine",
        "2": "Semaine prochaine",
    };

    const messageContent = {
        embeds: [
            {
                color: 0xff0000,
                title: `🗓️ **__${
                    diplayWeek[weekNumber] !== undefined ? diplayWeek[weekNumber] : `Dans ${weekNumber} semaines`
                }__ ↔ ${displayDate}** `,
                fields: messageFields,
                footer: {
                    text: `ENIGMA - ${capitalize(userCursus)}`,
                },
            },
        ],
    };

    // Add buttons to message
    const buttonsRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`EDT${parseInt(weekNumber) - 1}`)
            .setLabel("❰❰ ­ Précédent")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(parseInt(weekNumber) <= 1),
        new ButtonBuilder()
            .setLabel("Détails")
            .setStyle(ButtonStyle.Link)
            .setURL(userCursus == Cursus.CYBER ? process.env.LINK_CYBER : process.env.LINK_RETAIL),
        new ButtonBuilder()
            .setCustomId(`EDT${parseInt(weekNumber) + 1}`)
            .setLabel("Suivant ­ ❱❱")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(parseInt(weekNumber) >= 60)
    );
    messageContent["components"] = [buttonsRow];

    // Send the message
    await interaction.editReply(messageContent);

    // Add reactions to the message
    (await interaction.fetchReply()).react(process.env.EMOJI_MERCI);
};
