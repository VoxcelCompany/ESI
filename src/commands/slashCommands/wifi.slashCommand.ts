import { SlashCommandBuilder } from "discord.js";

class WifiSlashCommand {
    public getSlashCommand(): Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> {
        return new SlashCommandBuilder()
            .setName("wifi")
            .setDescription("Affiche diverses informations concernant la connexion wifi d'ENIGMA");
    }
}

export default new WifiSlashCommand();
