import { SlashCommandBuilder } from "discord.js";

class InfoSlashCommand {
    public getSlashCommand(): Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> {
        return new SlashCommandBuilder()
            .setName("info")
            .setDescription("Affiche diverses informations concernant le robot");
    }
}

export default new InfoSlashCommand();
