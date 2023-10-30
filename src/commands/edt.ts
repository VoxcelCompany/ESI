import { CacheType, Client, GuildMember, ModalSubmitInteraction } from "discord.js";
import discordFormatterService from "../service/discordFormatter.service";
import edtService from "../service/edt.service";
import CommandType from "../utils/enum/CommandType";

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

    const { data: messageContent } = edtService.getEdtMessageContent(messageFields, +weekNumber, userCursus);

    // Send the message
    await interaction.editReply(messageContent);

    // Add reactions to the message
    if (type !== CommandType.COMMAND) return;

    (await interaction.fetchReply()).react(process.env.EMOJI_MERCI);
};
