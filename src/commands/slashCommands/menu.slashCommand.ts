import { SlashCommandBuilder } from "discord.js";
import MenuService from "../../service/menu.service";
import { getMomentDate } from "../../utils/dates";

export default async (): Promise<Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">> => {
    const menusDays: Array<string> = await MenuService.getDays();
    return new SlashCommandBuilder()
        .setName('menu')
        .setDescription('Affiche le menu du jour sélectionné')
        .addStringOption(option => {
                option = option.setName('jour')
                    .setDescription('Jour concerné')
                    .setRequired(true);

                menusDays.forEach((day) => {
                    option = option.addChoices({
                        name: day,
                        value: getMomentDate(day, "dddd D MMMM").format('L'),
                    });
                });

                return option;
            },
        );
}