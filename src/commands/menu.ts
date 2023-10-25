import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CacheType,
    ModalSubmitInteraction,
    SlashCommandBuilder,
} from "discord.js";
import CommandType from "../utils/enum/CommandType";
import MenuService from "../service/menu.service";
import Menu from "../models/Menu";
import {getMomentDate} from "../utils/dates";

interface MenuParams {
    chosenOptionIndex: string;
    interaction: ModalSubmitInteraction<CacheType>;
    commandType: CommandType;
}

export const menu = async (params: MenuParams): Promise<any> => {
    const {chosenOptionIndex, interaction, commandType} = params;

    if (commandType === CommandType.BUTTON) {
        await interaction.deferUpdate();
    } else {
        await interaction.deferReply({ephemeral: false});
    }

    const menusDays: Array<string> = await MenuService.getDays();
    const menu: Menu = await MenuService.getDayMenu(getMomentDate(menusDays[chosenOptionIndex], "dddd D MMMM"));

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

    // Add buttons to message
    const buttonsRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`menu${parseInt(chosenOptionIndex) - 1}`).setLabel("❰❰ ­ Précédent").setStyle(ButtonStyle.Danger).setDisabled(parseInt(chosenOptionIndex) <= 0),
        new ButtonBuilder().setCustomId(`menu${parseInt(chosenOptionIndex) + 1}`).setLabel("Suivant ­ ❱❱").setStyle(ButtonStyle.Danger).setDisabled(parseInt(chosenOptionIndex) + 1 >= MenuService.getMenusDaysNumber()),
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
                        value: `${index}`,
                    });
                });

                return option;
            },
        );
};