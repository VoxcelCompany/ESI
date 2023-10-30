import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalSubmitInteraction, SlashCommandBuilder } from "discord.js";
import CommandType from "../utils/enum/CommandType";
import MenuService from "../service/menu.service";
import Menu from "../models/Menu";
import { getMomentDate } from "../utils/dates";
import moment, { Moment } from "moment-timezone";

interface MenuParams {
    chosenOption: string;
    interaction: ModalSubmitInteraction;
    commandType: CommandType;
}

export const menu = async (params: MenuParams): Promise<any> => {
    const {chosenOption, interaction, commandType} = params;

    if (commandType === CommandType.BUTTON) {
        await interaction.deferUpdate();
    } else {
        await interaction.deferReply({ephemeral: false});
    }

    const chosenDate: Moment = getMomentDate(chosenOption, 'L');
    const menu: Menu = await MenuService.getDayMenu(chosenDate);

    // const fields: Array<{name: string, value: string}> = menu.starter

    // Set the message content, with formatted fields
    const messageContent = {
        embeds: [{
            color: 0xff0005,
            title: `Menu du ${menu.date.format('L')}`,
            fields: [
                {
                    name: 'Entrées :',
                    value: menu.starter.map((starter) => `• ${starter}`).join('\n'),
                },
                {
                    name: 'Plats :',
                    value: menu.main.map((main) => `• ${main}`).join('\n'),
                },
            ],
            footer: {
                text: `MENU RU CHÂTILLON - ${menu.date.format('L')}`,
            },
        }],
    };

    const lastMenuDate: Moment = await MenuService.getLastDate();
    const previousMenuDate: string = moment(chosenDate).subtract(1, 'day').format('L');
    const nextMenuDate: string = moment(chosenDate).add(1, 'day').format('L');

    // Add buttons to message
    const buttonsRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`menu${previousMenuDate}`).setLabel("❰❰ ­ Précédent").setStyle(ButtonStyle.Danger).setDisabled(chosenDate.isSameOrBefore(getMomentDate())),
        new ButtonBuilder().setCustomId(`menu${nextMenuDate}`).setLabel("Suivant ­ ❱❱").setStyle(ButtonStyle.Danger).setDisabled(chosenDate.isSameOrAfter(lastMenuDate)),
    );
    messageContent["components"] = [buttonsRow];

    // Send the message
    await interaction.editReply(messageContent);

    // Add reactions to the message
    await (await interaction.fetchReply()).react(process.env.EMOJI_MERCI);
};

export const menuSlashCommand = async (): Promise<Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">> => {
    const menusDays: Array<string> = await MenuService.getDays();
    return new SlashCommandBuilder()
        .setName('menu')
        .setDescription('Affiche le menu du jour sélectionné')
        .addStringOption(option => {
                option = option.setName('jour')
                    .setDescription('Jour concerné')
                    .setRequired(true);

                menusDays.forEach((day, index) => {
                    option = option.addChoices({
                        name: day,
                        value: getMomentDate(day, "dddd D MMMM").format('L'),
                    });
                });

                return option;
            },
        );
};