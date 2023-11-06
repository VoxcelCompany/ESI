import { SlashCommandBuilder } from "discord.js";

class AideSlashCommand {
    public getSlashCommand(): Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> {
        return new SlashCommandBuilder()
            .setName("aide")
            .setDescription("Affiche la liste des commandes disponibles par le robot");
    }
}

export default new AideSlashCommand();
