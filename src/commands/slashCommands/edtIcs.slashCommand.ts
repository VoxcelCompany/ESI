import { CacheType, GuildMember, InteractionReplyOptions, ModalSubmitInteraction } from "discord.js";
import edtService from "../../service/edt.service";
import EdtIcsService from "../../service/edtIcs.service";
import { CURSUS } from "../../utils/constants/Cursus";
import CommandType from "../../utils/enum/CommandType";
import Cursus from "../../utils/enum/Cursus";
import { capitalize } from "../../utils/stringManager";

interface IcsParams {
    cursus?: string;
    interaction: ModalSubmitInteraction<CacheType>;
    type: CommandType;
}

export default async (params: IcsParams): Promise<void> => {
    const { cursus, interaction, type } = params;

    if (type != CommandType.BUTTON) {
        await interaction.deferReply();
    }

    let selectedCursus: Cursus;

    if (cursus) {
        selectedCursus = type === CommandType.BUTTON ? (cursus.toUpperCase() as Cursus) : CURSUS[+cursus - 1];
    } else {
        const userCursusRes = edtService.getUserCursus(interaction.member as GuildMember);

        if (!userCursusRes || userCursusRes.errorMessage) {
            const messageContent = userCursusRes.errorMessage;

            if (type == CommandType.BUTTON) {
                await interaction.reply({
                    content: messageContent,
                    ephemeral: true,
                });
            } else {
                await interaction.editReply(messageContent);
            }

            return;
        } else {
            selectedCursus = userCursusRes.userCursus;
        }
    }

    const icsDatas = await EdtIcsService.getIcsFile(selectedCursus);

    if (!icsDatas.success) {
        await interaction.editReply(icsDatas.content);
        return;
    }

    const cursusName = capitalize(selectedCursus);

    const messageContent: InteractionReplyOptions = {
        content: `Voici l'emploi du temps de la filière ${cursusName}`,
        files: [
            {
                name: `Emploi_du_temps_${cursusName}.ics`,
                attachment: Buffer.from(icsDatas.content),
            },
        ],
    };

    if (type == CommandType.BUTTON) {
        await interaction.reply({
            ...messageContent,
            ephemeral: true,
        });
    } else {
        await interaction.editReply(messageContent);
    }
};
